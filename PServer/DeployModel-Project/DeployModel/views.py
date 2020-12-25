from django.http import HttpResponse
from sklearn import preprocessing

from django.shortcuts import render
import joblib
import numpy as np
import pandas as pd
import cv2
import os
from django.http import StreamingHttpResponse
import matplotlib.pyplot as plt
from sklearn.neighbors import KNeighborsClassifier
from sklearn import preprocessing
from sklearn.model_selection import train_test_split
#------------------Pest Forecasting Model---------------#
def predictPest(que):
    dataset = pd.read_csv('PestDataset.csv')
    
    dataset.head(5)

    dataset.shape

    X = dataset.iloc[:,:3]
    X

    y = dataset.iloc[:,3:]
    y

    from sklearn.preprocessing import LabelEncoder
    le = LabelEncoder()
    y = le.fit_transform(y)


    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, random_state=1)

    from sklearn.multioutput import MultiOutputClassifier
    from sklearn.neighbors import KNeighborsClassifier
    knn = KNeighborsClassifier(n_neighbors=1)
    cls = MultiOutputClassifier(knn, n_jobs=-1)
    cls.fit(X_train,y_train)

    ans = cls.predict(que)
    ans2 = ans[0]
    
    array1=[]
    array1.append(ans2[0])
    array1.append(ans2[1])

    dataset = dataset[(dataset.Insect1 != ans2[0]) & (dataset.Insect1 != ans2[1])]

    X = dataset.iloc[:,:3]
    X

    y = dataset.iloc[:,3:]
    y


    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, random_state=1)

    from sklearn.multioutput import MultiOutputClassifier
    from sklearn.neighbors import KNeighborsClassifier
    knn = KNeighborsClassifier(n_neighbors=1)
    cls = MultiOutputClassifier(knn, n_jobs=-1)
    cls.fit(X_train,y_train)
    predictions = cls.predict(X_test)

    ans = cls.predict(que)
    ans2 = ans[0]
    
    array1.append(ans2[0])
    array1.append(ans2[1])

    dataset = dataset[(dataset.Insect1 != ans2[0]) & (dataset.Insect1 != ans2[1])]

    X = dataset.iloc[:,:3]
    X

    y = dataset.iloc[:,3:]
    y


    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, random_state=1)

    from sklearn.multioutput import MultiOutputClassifier
    from sklearn.neighbors import KNeighborsClassifier
    knn = KNeighborsClassifier(n_neighbors=1)
    cls = MultiOutputClassifier(knn, n_jobs=-1)
    cls.fit(X_train,y_train)
    predictions = cls.predict(X_test)
    

    ans = cls.predict(que)
    ans2 = ans[0]
    
    array1.append(ans2[0])
    array1.append(ans2[1])

    dataset = dataset[(dataset.Insect1 != ans2[0]) & (dataset.Insect1 != ans2[1])]

    X = dataset.iloc[:,:3]
    X

    y = dataset.iloc[:,3:]
    y


    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, random_state=1)

    from sklearn.multioutput import MultiOutputClassifier
    from sklearn.neighbors import KNeighborsClassifier
    knn = KNeighborsClassifier(n_neighbors=1)
    cls = MultiOutputClassifier(knn, n_jobs=-1)
    cls.fit(X_train,y_train)
    predictions = cls.predict(X_test)
    
    ans = cls.predict(que)
    ans2 = ans[0]
    
    array1.append(ans2[0])
    array1.append(ans2[1])

    dataset = dataset[(dataset.Insect1 != ans2[0]) & (dataset.Insect1 != ans2[1])]

    X = dataset.iloc[:,:3]
    X

    y = dataset.iloc[:,3:]
    y


    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split( X, y, test_size=0.2, random_state=1)

    from sklearn.multioutput import MultiOutputClassifier
    from sklearn.neighbors import KNeighborsClassifier
    knn = KNeighborsClassifier(n_neighbors=1)
    cls = MultiOutputClassifier(knn, n_jobs=-1)
    cls.fit(X_train,y_train)
    predictions = cls.predict(X_test)
    print("The Accuracy of the Model is: ",cls.score(X,np.array(y))*100,"%")
    

    ans = cls.predict(que)
    ans2 = ans[0]
    
    array1.append(ans2[0])
    array1.append(ans2[1])

    array1 = list(dict.fromkeys(array1))
    print(array1)
    
    return array1
    

#---------------Vegetables Predictions------------#
def predictVegetable(que):
    dataset = pd.read_csv("VegetablesDataSet.csv")

    dataset.head(6)

    dataset.shape

    dataset.columns

    for i in dataset.columns:
        print('{}   dtype    "{}!"'.format(i,dataset[i].dtype))

    print(dataset['Vegetable'].unique())
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    print(x)
    predicted=[]
    predicted.append(ans[0])

    dataset = dataset[dataset.Vegetable != ans[0]]
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    predicted.append(ans[0])
    print(x)

    dataset = dataset[dataset.Vegetable != ans[0]]
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans

    predicted.append(ans[0])
    print(x)

    dataset = dataset[dataset.Vegetable != ans[0]]
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    print(x)
    predicted.append(ans[0])

    dataset = dataset[dataset.Vegetable != ans[0]]
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans

    predicted.append(ans[0])


    print(x)
    print(predicted)
    return predicted

#################FRUITS#####################

def predictFruits(que):
    dataset = pd.read_csv("FruitsDataSet.csv")

    dataset.head(6)

    dataset.shape

    dataset.columns

    for i in dataset.columns:
        print('{}   dtype    "{}!"'.format(i,dataset[i].dtype))

    print(dataset['Fruit'].unique())
    X=dataset.iloc[:,:-1]
    y=dataset.iloc[:,3]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    print(x)
    predicted=[]
    predicted.append(ans[0])

    dataset = dataset[dataset.Fruit != ans[0]]
    X=dataset.iloc[:,:-1]
    y=dataset.iloc[:,3]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    predicted.append(ans[0])
    print(x)

    dataset = dataset[dataset.Fruit != ans[0]]
    X=dataset.iloc[:,:-1]
    y=dataset.iloc[:,3]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans

    predicted.append(ans[0])
    print(x)

    dataset = dataset[dataset.Fruit != ans[0]]
    X=dataset.iloc[:,:-1]
    y=dataset.iloc[:,3]


    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    print(x)
    predicted.append(ans[0])

    dataset = dataset[dataset.Fruit != ans[0]]
    X=dataset.iloc[:,:-1]
    y=dataset.iloc[:,3]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans

    predicted.append(ans[0])


    print(x)
    print(predicted)
    return predicted
#################Crops######################
def predictCrops(que):
    dataset = pd.read_csv("CropsDataSet.csv")

    dataset.head(6)

    dataset.shape

    dataset.columns

    for i in dataset.columns:
        print('{}   dtype    "{}!"'.format(i,dataset[i].dtype))

    print(dataset['Crop'].unique())
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    print(x)
    predicted=[]
    predicted.append(ans[0])

    dataset = dataset[dataset.Crop != ans[0]]
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    predicted.append(ans[0])
    print(x)

    dataset = dataset[dataset.Crop != ans[0]]
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans

    predicted.append(ans[0])
    print(x)

    dataset = dataset[dataset.Crop != ans[0]]
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
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

    ans = cls.predict(que)
    x=ans


    print(x)
    predicted.append(ans[0])

    dataset = dataset[dataset.Crop != ans[0]]
    X=dataset.iloc[:,1:-1]
    y=dataset.iloc[:,4]



    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2, random_state = 42)

    from sklearn.tree import DecisionTreeClassifier
    cls = DecisionTreeClassifier(criterion='entropy',random_state=42)
    cls.fit(X_train, y_train)

    y_pred = cls.predict(X_test)


    # Making the Confusion Matrix
    from sklearn.metrics import confusion_matrix
    cm = confusion_matrix(y_test, y_pred)

    print(cm)

    print("ACCURACY OF MODEL IS : ",cls.score(X_test,y_test)*100,"%")

    ans = cls.predict(que)
    x=ans

    predicted.append(ans[0])


    print(x)
    print(predicted)
    return predicted



def home(request):
    return render(request,"home.html")

def result(request):
    cls = joblib.load('finalized_dtmode.sav')

    lis = []

    lis.append(request.GET["SoilPh"])
    lis.append(request.GET["RelativeHumidity"])
    lis.append(request.GET["SoilTemperature"])

    print(lis)

    ans = cls.predict([lis])

    return render(request,"result.html",{'ans': ans})

def pest(request):
    return render(request,"pest.html")

def pestresult(request):
    cls = joblib.load('pest.sav')

    lis = []

    lis.append(request.GET["SoilPh"])
    lis.append(request.GET["RelativeHumidity"])
    lis.append(request.GET["SoilTemperature"])

    print(lis)

    pestans = predictPest([lis])
    print(pestans);

    return render(request,"pestresult.html",{'ans': pestans})


def fruit(request):
    return render(request,"fruit.html")

def fruitresult(request):
    cls = joblib.load('fruit.sav')

    lis = []

    lis.append(request.GET["SoilPh"])
    lis.append(request.GET["RelativeHumidity"])
    lis.append(request.GET["SoilTemperature"])

    print(lis)

    fruitans = predictFruits([lis])
    print(fruitans);

    return render(request,"fruitresult.html",{'ans': fruitans})

def vegetable(request):
    return render(request,"vegetable.html")

def vegetableresult(request):

    lis = []

    lis.append(request.GET["SoilPh"])
    lis.append(request.GET["RelativeHumidity"])
    lis.append(request.GET["SoilTemperature"])

    print(lis)

    vegetableans = predictVegetable([lis])

    return render(request,"vegetableresult.html",{'ans': vegetableans})

def crop(request):
    return render(request,"crop.html")

def cropresult(request):
    cls = joblib.load('crop.sav')

    lis = []

    lis.append(request.GET["SoilPh"])
    lis.append(request.GET["RelativeHumidity"])
    lis.append(request.GET["SoilTemperature"])

    print(lis)

    cropans = predictCrops([lis])

    return render(request,"cropresult.html",{'ans': cropans})

def risk(request):
    return render(request,"risk.html")

def riskresult(request):
    cls = joblib.load('risk.sav')

    lis = []

    lis.append(request.GET["SoilPh"])
    lis.append(request.GET["RelativeHumidity"])
    lis.append(request.GET["SoilTemperature"])

    print(lis)

    riskans = cls.predict([lis])

    return render(request,"riskresult.html",{'ans': riskans})


def detect(request):
    return StreamingHttpResponse(gen(),content_type="multipart/x-mixed-replace;boundary=frame")


def gen():
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read('C:\\Users\\ZBook\\Desktop\\FYP\\analytics\\PServer\\DeployModel-Project\\DeployModel\\trainer\\trainer.yml')
    cascadePath = "C:\\Users\\ZBook\\Desktop\\FYP\\analytics\PServer\\DeployModel-Project\DeployModel\\haarcascade_frontalface_default.xml"
    faceCascade = cv2.CascadeClassifier(cascadePath)
    font = cv2.FONT_HERSHEY_SIMPLEX
    #iniciate id counter
    id = 0 
    # names related to ids: example ==> Marcelo: id=1,  etc
    names = ['Usman','Aamir'] 
    # Initialize and start realtime video capture
    cam = cv2.VideoCapture(0)
    cam.set(3, 640) # set video widht
    cam.set(4, 480) # set video height
    # Define min window size to be recognized as a face
    minW = 0.1*cam.get(3)
    minH = 0.1*cam.get(4)
    while True:
        ret, img =cam.read()
        img = cv2.flip(img, 1) # Flip vertically
        gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale( 
            gray,
            scaleFactor = 1.2,
            minNeighbors = 5,
            minSize = (int(minW), int(minH))
        )
        for(x,y,w,h) in faces:
            cv2.rectangle(img, (x,y), (x+w,y+h), (0,255,0), 2)
            id, confidence = recognizer.predict(gray[y:y+h,x:x+w])
            # Check if confidence is less them 100 ==> "0" is perfect match 
            if (confidence < 100):
                id = names[id]
                confidence = "  ".format(round(100 - confidence))
            else:
                id = "unknown"
                confidence = "  ".format(round(100 - confidence))
            cv2.putText(img, str(id), (x+5,y-5), font, 1, (255,255,255), 2)
            cv2.putText(img, str(confidence), (x+5,y+h-5), font, 1, (255,255,0), 1)  
        if(np.shape(img)!=()):
            (flag,incodedimg)=cv2.imencode(".jpg",img)
            yield(b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n'+bytearray(incodedimg)+b'\r\n') 
        k = cv2.waitKey(10) & 0xff # Press 'ESC' for exiting video
        if k == 27:
            break
        # Do a bit of cleanup
    print("\n [INFO] Exiting Program and cleanup stuff")
    cam.release()
