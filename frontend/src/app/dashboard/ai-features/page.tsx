import { AIMessageSuggestions } from '@/components/AIMessageSuggestions';
import { AICampaignSummary } from '@/components/AICampaignSummary';

export default function AIFeaturesPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI-Powered Features</h1>
        <p className="text-muted-foreground">
          Enhance your CRM experience with our AI-powered tools
        </p>
      </div>

      <div className="grid gap-8">
        <AIMessageSuggestions />
        <AICampaignSummary />
      </div>
    </div>
  );
} 