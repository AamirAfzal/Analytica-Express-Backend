# Load EDA Pkgs
import pandas as pd
import numpy as np


# Load Data Viz Pkgs
import matplotlib.pyplot as plt
import seaborn as sns

# ML Pkgs
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB,MultinomialNB
from sklearn.metrics import accuracy_score,hamming_loss,classification_report

### Split Dataset into Train and Text
from sklearn.model_selection import train_test_split
# Feature engineering
from sklearn.feature_extraction.text import TfidfVectorizer

# Multi Label Pkgs
from skmultilearn.problem_transform import BinaryRelevance
from skmultilearn.problem_transform import ClassifierChain
from skmultilearn.problem_transform import LabelPowerset
from skmultilearn.adapt import MLkNN


# Load Dataset
df = pd.read_csv("VegetablessDataSet.csv")


df.head()

df.loc[0].SoilPh

df.dtypes

# Convert to Float
df['Cabbage'] = df['Cabbage'].astype(float)

df.dtypes

# Value Count
sns.countplot(df['Cabbage'])

# Value Count
sns.countplot(df['Cabbage'])

df['Cabbage'].value_counts()

df['Cabbage'].value_counts().plot(kind='bar')

import neattext as nt
import neattext.functions as nfx

# Explore For Noise
df['Cabbage'].apply(lambda x:nt.TextFrame(x).noise_scan())

# Explore For Noise
df['Cabbage'].apply(lambda x:nt.TextExtractor(x).extract_stopwords())

dir(nfx)

# Explore For Noise
df['Cabbage'].apply(nfx.remove_stopwords)

corpus = df['Cabbage'].apply(nfx.remove_stopwords)

tfidf = TfidfVectorizer()

tfidf

# Build Features
Xfeatures = tfidf.fit_transform(corpus).toarray()

Xfeatures

df.head()

y = df[['Cabbage' 'Carrot' 'Cauliflower' 'Cucumber' 'Eggplant' 'Garlic' 'Onion'
 'Parsley' 'Pea' 'Potato' 'Radish' 'Spinach' 'Sweet Potato' 'Tomato'
 'Turnip']]

# Split Data
X_train,X_test,y_train,y_test = train_test_split(Xfeatures,y,test_size=0.3,random_state=42)


print(df['SoilpH'].shape)
print(X_train.shape)

import skmultilearn

dir(skmultilearn)

# Convert Our Multi-Label Prob to Multi-Class
# binary classficiation
binary_rel_clf = BinaryRelevance(MultinomialNB())

binary_rel_clf.fit(X_train,y_train)

# Predictions
br_prediction = binary_rel_clf.predict(X_test)

br_prediction

# Convert to Array  To See Result
br_prediction.toarray()

# Accuracy
accuracy_score(y_test,br_prediction)


# Hamming Loss :Incorrect Predictions
# The Lower the result the better
hamming_loss(y_test,br_prediction)

def build_model(model,mlb_estimator,xtrain,ytrain,xtest,ytest):
    # Create an Instance
    clf = mlb_estimator(model)
    clf.fit(xtrain,ytrain)
    # Predict
    clf_predictions = clf.predict(xtest)
    # Check For Accuracy
    acc = accuracy_score(ytest,clf_predictions)
    ham = hamming_loss(ytest,clf_predictions)
    result = {"accuracy:":acc,"hamming_score":ham}
    return result

clf_chain_model = build_model(MultinomialNB(),ClassifierChain,X_train,y_train,X_test,y_test)

clf_chain_model

clf_labelP_model = build_model(MultinomialNB(),LabelPowerset,X_train,y_train,X_test,y_test)

clf_labelP_model

ex1 = df['SoilPh'].iloc[0]

# Vectorized
vec_example = tfidf.transform([ex1])
#prediction
binary_rel_clf.predict(vec_example).toarray()

array([[1., 1., 0.]])

import joblib

binary_rel_clf_file = open("binary_rel_clf_model_file.pkl","wb")
joblib.dump(binary_rel_clf,binary_rel_clf_file)
binary_rel_clf_file.close()

# Save Vectorizer
tfidf_vectorizer_file = open("tfidf_vectorizer_SO_tags_file.pkl","wb")
joblib.dump(tfidf,tfidf_vectorizer_file)
tfidf_vectorizer_file.close()
#### Adapted Algorithm
from skmultilearn.adapt import MLkNN
