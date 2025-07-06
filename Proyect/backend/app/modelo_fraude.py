# modelo_fraude.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Leer datos
df = pd.read_csv("C:/Users/User/Desktop/Tesis/Proyect/backend/datos_fraude_simple.csv")

# Variables predictoras y objetivo
X = df.drop("fraude", axis=1)
y = df["fraude"]

# División de entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entrenar modelo
modelo = RandomForestClassifier(n_estimators=100, random_state=42)
modelo.fit(X_train, y_train)

# Guardar modelo
joblib.dump(modelo, "modelo_entrenado.pkl")
print("✅ Modelo entrenado y guardado como 'modelo_entrenado.pkl'")
