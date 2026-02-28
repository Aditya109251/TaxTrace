import axios from 'axios';

export interface AnalysisPayload {
  project_id: string;
  item_name: string;
  quantity: number;
  claimed_price: number;
  market_price: number;
  completion_percentage: number;
  funds_released: number;
  project_type: string;
}

export interface AnalysisResult {
  price_deviation_score: number;
  quantity_deviation_score: number;
  burn_rate_score: number;
  overall_risk_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  explanation: string;
}

export const analyzeMaterial = async (payload: AnalysisPayload): Promise<AnalysisResult> => {
  const response = await axios.post('/api/analyze', payload);
  return response.data;
};
