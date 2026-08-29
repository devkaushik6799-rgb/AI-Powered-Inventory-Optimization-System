import xgboost as xgb
from sklearn.metrics import mean_absolute_error

def prepare_features(df):
    """Engineers 'Lag' features so the model understands time trends."""
    df = df.copy().sort_values(['product_id', 'date'])
    # Lag_1: What were the sales yesterday?
    df['lag_1'] = df.groupby('product_id')['sales'].shift(1)
    # Rolling_7: What was the average of the last week?
    df['rolling_7'] = df.groupby('product_id')['sales'].transform(lambda x: x.shift(1).rolling(7).mean())
    return df.dropna()

def train_xgboost(df):
    """Trains the XGBoost Regressor and returns accuracy metrics."""
    features = ['lag_1', 'rolling_7']
    X = df[features]
    y = df['sales']
    
    
    split = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split], X.iloc[split:]
    y_train, y_test = y.iloc[:split], y.iloc[split:]
    
    model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5)
    model.fit(X_train, y_train)
    
    error = mean_absolute_error(y_test, model.predict(X_test))
    return model, features, error