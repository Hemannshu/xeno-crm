import axios from 'axios';

const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';

interface MessageSuggestion {
  message: string;
  tone: string;
  imageUrl?: string;
}

interface CampaignSummary {
  summary: string;
  insights: string[];
}

export class AIService {
  private static async generateWithOllama(prompt: string, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[Ollama] Attempt ${attempt} to connect to ${OLLAMA_API_URL}`);
        console.log('[Ollama] Request payload:', {
          model: 'phi',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 250
          }
        });

        const response = await axios.post(OLLAMA_API_URL, {
          model: 'phi',
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.95,
            max_tokens: 250
          }
        }, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('[Ollama] Response status:', response.status);
        console.log('[Ollama] Response headers:', response.headers);
        console.log('[Ollama] Response data:', response.data);

        if (!response.data?.response) {
          console.error('[Ollama] Invalid response:', response.data);
          throw new Error('Invalid response from Ollama');
        }

        // Ollama returns the response in the 'response' field
        const generatedText = response.data.response;
        console.log('[Ollama] Generated text:', generatedText);
        
        // Clean up the response text
        return generatedText
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .join('\n');
      } catch (error: any) {
        console.error(`[Ollama] Attempt ${attempt} failed:`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          code: error.code,
          stack: error.stack
        });

        if (attempt === retries) {
          throw new Error(`Failed to connect to Ollama after ${retries} attempts. Please make sure Ollama is running and the phi model is pulled.`);
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Failed to connect to Ollama');
  }

  private static async getRelevantImage(tone: string, message: string): Promise<string | undefined> {
    if (!UNSPLASH_API_KEY) {
      console.warn('UNSPLASH_API_KEY not set, skipping image recommendation');
      return undefined;
    }

    try {
      const searchQuery = `${tone} ${message.split(' ').slice(0, 3).join(' ')}`;
      
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_API_KEY}`,
        },
        params: {
          query: searchQuery,
          per_page: 1,
          orientation: 'landscape',
        },
      });

      if (response.data.results.length > 0) {
        return response.data.results[0].urls.regular;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return undefined;
    }
  }

  static async generateMessageSuggestions(
    campaignObjective: string,
    targetAudience: string
  ): Promise<MessageSuggestion[]> {
    try {
      const prompt = `Generate 3 different marketing messages for the following campaign objective: "${campaignObjective}" targeting: "${targetAudience}". 
      Each message should be on a new line and include a tone description separated by a pipe character (|).
      Do not include numbers or bullet points.
      Example format:
      Welcome back! We've missed you! | friendly
      Exclusive offer just for you! | exciting
      Don't miss out on our latest deals! | urgent
      
      Make sure each message is unique and appropriate for the target audience.`;

      console.log('[Backend] Sending prompt to Ollama:', prompt);
      const generatedText = await this.generateWithOllama(prompt);
      console.log('[Backend] Generated text:', generatedText);
      
      // Parse the generated text into messages
      const rawMessages = generatedText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => {
          // Remove any leading numbers, dots, or spaces
          const cleanLine = line.replace(/^\d+\.\s*/, '').trim();
          // Split by the last occurrence of '|' to handle messages that might contain '|'
          const lastPipeIndex = cleanLine.lastIndexOf('|');
          if (lastPipeIndex === -1) {
            console.warn('[Backend] Skipping line without tone separator:', cleanLine);
            return null;
          }
          
          const message = cleanLine.substring(0, lastPipeIndex).trim();
          const tone = cleanLine.substring(lastPipeIndex + 1).trim();
          
          if (!message || !tone) {
            console.warn('[Backend] Skipping line with empty message or tone:', { message, tone });
            return null;
          }
          
          return { message, tone };
        })
        .filter((msg): msg is MessageSuggestion => msg !== null);

      console.log('[Backend] Parsed messages:', rawMessages);

      if (rawMessages.length === 0) {
        throw new Error('No valid messages generated');
      }

      // Take only the first 3 messages and add image URLs
      const messages = await Promise.all(
        rawMessages
          .slice(0, 3)
          .map(async (msg) => {
            const imageUrl = await this.getRelevantImage(msg.tone, msg.message);
            return { ...msg, imageUrl };
          })
      );

      console.log('[Backend] Final messages with images:', messages);
      return messages;
    } catch (error) {
      console.error('[Backend] Error generating message suggestions:', error);
      // Fallback to template-based messages if Ollama fails
      const fallbackMessages = [
        {
          message: `We noticed you haven't been active lately. ${campaignObjective.includes('inactive') ? 'We miss you!' : 'Here\'s a special offer just for you!'}`,
          tone: 'friendly'
        },
        {
          message: `Exclusive ${campaignObjective.toLowerCase()} opportunity waiting for you!`,
          tone: 'exciting'
        },
        {
          message: `Don't miss out on our latest ${campaignObjective.toLowerCase()} campaign!`,
          tone: 'urgent'
        }
      ];

      console.log('[Backend] Using fallback messages:', fallbackMessages);
      return Promise.all(
        fallbackMessages.map(async (msg) => ({
          ...msg,
          imageUrl: await this.getRelevantImage(msg.tone, msg.message)
        }))
      );
    }
  }

  static async generateCampaignSummary(
    stats: {
      totalReached: number;
      delivered: number;
      failed: number;
      openRate?: number;
      clickRate?: number;
      customerSegments?: { [key: string]: number };
    }
  ): Promise<CampaignSummary> {
    try {
      const prompt = `Generate a concise, professional summary of these campaign statistics: ${JSON.stringify(stats)}. 
      Include key insights and recommendations. Format the response with a main summary followed by bullet points for insights.`;

      const generatedText = await this.generateWithOllama(prompt);
      const [summary, ...insights] = generatedText.split('\n').filter(line => line.trim().length > 0);

      return {
        summary: summary || 'Campaign summary not available',
        insights: insights || [],
      };
    } catch (error) {
      console.error('Error generating campaign summary:', error);
      const deliveryRate = ((stats.delivered / stats.totalReached) * 100).toFixed(1);
      const failureRate = ((stats.failed / stats.totalReached) * 100).toFixed(1);

      const summary = `Campaign Performance Summary:
      - Total Reach: ${stats.totalReached} users
      - Successful Deliveries: ${stats.delivered} (${deliveryRate}%)
      - Failed Deliveries: ${stats.failed} (${failureRate}%)`;

      const insights = [
        `Delivery Success Rate: ${deliveryRate}%`,
        stats.openRate ? `Open Rate: ${stats.openRate}%` : '',
        stats.clickRate ? `Click Rate: ${stats.clickRate}%` : '',
        stats.customerSegments ? `Top Segment: ${Object.entries(stats.customerSegments)
          .sort(([,a], [,b]) => b - a)[0]?.[0]}` : ''
      ].filter(insight => insight !== '');

      return {
        summary,
        insights
      };
    }
  }

  static async generateSegmentRule(prompt: string): Promise<any> {
    try {
      const fullPrompt = `Generate a SINGLE segment rule based on this description: "${prompt}". 
      Return ONLY a valid JSON object with this exact structure:
      {
        "field": string,
        "operator": string,
        "value": string | number | boolean
      }
      
      Valid operators are: equals, notEquals, contains, notContains, greaterThan, lessThan, between, in, notIn
      For the given description, choose the most appropriate single rule.
      Do not include any additional text or explanation, only the JSON object.`;

      const generatedText = await this.generateWithOllama(fullPrompt);
      
      try {
        // Clean the response to ensure it's valid JSON
        const cleanedText = generatedText.trim()
          .replace(/^[^{]*/, '')  // Remove anything before first {
          .replace(/[^}]*$/, '')  // Remove anything after last }
          .replace(/,\s*{/g, '{') // Remove any comma followed by another object
          .replace(/}\s*,/g, '}'); // Remove any comma after an object
        
        const rule = JSON.parse(cleanedText);
        
        // Validate the rule structure
        if (!rule.field || !rule.operator || rule.value === undefined) {
          throw new Error('Invalid rule structure');
        }
        
        return rule;
      } catch (parseError) {
        console.error('Error parsing generated rule:', parseError);
        // Fallback to a default rule
        return {
          field: 'lastPurchaseDate',
          operator: 'lessThan',
          value: new Date().toISOString().split('T')[0]
        };
      }
    } catch (error) {
      console.error('Error generating segment rule:', error);
      throw error;
    }
  }
} 