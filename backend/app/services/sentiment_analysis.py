from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

class SentimentAnalyzer:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
        self.model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")

    def get_sentiment(self, texts: list):
        """
        Analyze sentiment for a list of strings and return the aggregate score.
        FinBERT outputs: Positive, Negative, Neutral.
        """
        if not texts:
            return 0.0 # Neutral
        
        inputs = self.tokenizer(texts, padding=True, truncation=True, return_tensors='pt', max_length=512)
        outputs = self.model(**inputs)
        
        predictions = F.softmax(outputs.logits, dim=-1)
        
        # Mapping: 0: positive, 1: negative, 2: neutral
        # Positive score is at index 0, negative at index 1
        pos = predictions[:, 0].mean().item()
        neg = predictions[:, 1].mean().item()
        
        # Aggregate score: positive - negative
        sentiment_score = pos - neg
        return sentiment_score

sentiment_analyzer = SentimentAnalyzer()
