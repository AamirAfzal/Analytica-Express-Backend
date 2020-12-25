import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
dataset = pd.read_csv("AgricultureRisk.csv")

dataset.head(6)

dataset.shape

dataset.columns

for i in dataset.columns:
    print('{}   dtype    "{}!"'.format(i,dataset[i].dtype))

print(dataset['Risk'].unique())
X=dataset.iloc[:,:-1]
y=dataset.iloc[:,3]



from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

from sklearn.tree import DecisionTreeClassifier
cls = DecisionTreeClassifier(criterion='entropy',random_state=0)
cls.fit(X_train, y_train)

y_pred = cls.predict(X_test)


# Making the Confusion Matrix
from sklearn.metrics import confusion_matrix
cm = confusion_matrix(y_test, y_pred)

print(cm)

print("ACCURACY OF MODEL IS : ",cls.score(X_test,y_test)*100,"%")
#from sklearn.model_selection import train_test_split
#X_train, X_test, y_train, y_test = train_test_split(X,y, test_size= 0.20, random_state=2000)

#from sklearn.preprocessing import StandardScaler
#sc_x=StandardScaler()
#X_train=sc_x.fit_transform(X_train)

#from sklearn.ensemble import RandomForestClassifier
#cls = RandomForestClassifier(criterion='entropy',n_estimators=300,random_state=42)
#cls.fit(X_train,y_train)
#from sklearn.preprocessing import LabelEncoder
#labelencoder_X = LabelEncoder
#X = X.apply(LabelEncoder().fit_transform)



#print("Accuracy is: ",cls.score(X_test,y_test)*100,'%')

filename = 'risk.sav'
joblib.dump(cls, filename)
