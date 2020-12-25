import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib

dataset = pd.read_csv('PestDataset.csv')
    
dataset.head(5)

dataset.shape

X = dataset.iloc[:,:3]
print(X)

y = dataset.iloc[:,3:]
print(y)


from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, random_state=1)

from sklearn.multioutput import MultiOutputClassifier
from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=1)
cls = MultiOutputClassifier(knn, n_jobs=-1)
cls.fit(X,y)
predictions = cls.predict(X)
print("The Accuracy of the Model is: ",cls.score(X,np.array(y))*100)




filename = 'pest.sav'
joblib.dump(cls, filename)
