export const FILTERS = [
  { id: 'all', label: 'すべて' },
  { id: 'excellent', label: '◎' },
  { id: 'good', label: '○' },
  { id: 'fair', label: '△' },
  { id: 'poor', label: '×' },
  { id: 'rail', label: '鉄道周辺' },
  { id: 'bus', label: 'バス周辺' }
];

export const ACCESS_THRESHOLDS_KM = {
  excellent: 0.7,
  good: 1.5,
  fair: 3.0
};

export const WALKING_SPEED_KM_PER_HOUR = 4.5;

export const ROUTE_COLORS = {
  train: '#5B6CFF',
  bus: '#1DA57A'
};

export const SCORE_LABELS = {
  excellent: '◎',
  good: '○',
  fair: '△',
  poor: '×'
};

export const SCORE_TEXTS = {
  excellent: '行きやすい',
  good: '比較的行きやすい',
  fair: '工夫が必要',
  poor: '代替移動向き'
};
