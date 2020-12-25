from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',views.home,name="home"),
    path('result/',views.result,name="result"),
    path('fruit/',views.fruit,name="fruit"),
    path('fruitresult/',views.fruitresult,name="fruitresult"),
    path('vege/',views.vegetable,name="vegetable"),
    path('vegetableresult/',views.vegetableresult,name="vegetableresult"),
    path('crop/',views.crop,name="crop"),
    path('cropresult/',views.cropresult,name="cropresult"),
    path('risk/',views.risk,name="risk"),
    path('riskresult/',views.riskresult,name="riskresult"),
    path('monitor/',views.detect,name="monitorfeed"),
    path('pest/',views.pest,name="pest"),
    path('pestresult/',views.pestresult,name="pestresult"),
]
