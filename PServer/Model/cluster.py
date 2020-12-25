import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import joblib

dataset = pd.read_csv('FruitsDataSet.csv')

dataset.head()

dataset.count()

dataset.max()

dataset.min()

dataset.shape

dataset.isna().sum()

X = dataset.iloc[:, :-1].values

X

from sklearn.cluster import KMeans

#elbow method to find optimal number of clusters
wcss = []
for i in range(1, 8):
    clust = KMeans(n_clusters = i, init='k-means++',n_init=10, max_iter=300,tol=0.0001,random_state=42)
    clust.fit(X)
    wcss.append(clust.inertia_)

plt.plot(range(1, 8), wcss)
plt.plot(range(1, 8), wcss,'bo')
plt.title('The Elbow Method')
plt.xlabel('Number of clusters')
plt.ylabel('WCSS SCORES')
plt.show()


# Fitting K-Means to the dataset
clust2 = KMeans(n_clusters = 4, init = 'k-means++', random_state = 42)
y_clust2 = clust2.fit_predict(X)

# Visualising the clusters
plt.scatter(X[y_clust2 == 0, 0], X[y_clust2 == 0, 1], s = 10, c = 'red', label = 'Low Risk')
plt.scatter(X[y_clust2 == 1, 0], X[y_clust2 == 1, 1], s = 10, c = 'green', label = 'Medium Risk')
plt.scatter(X[y_clust2 == 2, 0], X[y_clust2 == 2, 1], s = 10, c = 'magenta', label = 'High Risk')
plt.scatter(X[y_clust2 == 3, 0], X[y_clust2 == 3, 1], s = 10, c = 'cyan', label = 'No Risk')
plt.xlim([-2,6])
plt.ylim([-30,60])
plt.title('Sample Stocks clusters')
plt.xlabel("pH")
plt.ylabel('Temperature')
plt.legend()
plt.show()

# Visualising the clusters based on study
plt.scatter(X[y_clust2 == 0, 0], X[y_clust2 == 0, 1], s = 10, c = 'red', label = 'Low Risk')
plt.scatter(X[y_clust2 == 1, 0], X[y_clust2 == 1, 1], s = 10, c = 'green', label = 'Medium Risk')
plt.scatter(X[y_clust2 == 2, 0], X[y_clust2 == 2, 1], s = 10, c = 'magenta', label = 'High Risk')
plt.scatter(X[y_clust2 == 3, 0], X[y_clust2 == 3, 1], s = 10, c = 'magenta', label = 'No Risk')
plt.xlim([-2,6])
plt.ylim([-30,60])
plt.title('Risk clusters')
plt.xlabel("Dividend's Yield")
plt.ylabel('Returns')
plt.legend()
plt.show()

filename = 'cluster.sav'
joblib.dump(cls, filename)
