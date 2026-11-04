import math_operations as mo
from math_operations import konversi_suhu_celsius_fahrenheit, konversi_suhu_celsius_kelvin
luas_persegi = mo.hitung_luas_persegi(5)
print(f"Luas persegi dengan sisi 5 adalah {luas_persegi}")
keliling_persegi = mo.hitung_keliling_persegi(5)
print(f"Keliling persegi dengan sisi 5 adalah {keliling_persegi}")
luas_lingkaran = mo.hitung_luas_lingkaran(5)
print(f"Luas lingkaran dengan jari-jari 5 adalah {luas_lingkaran:,.2f}")
keliling_lingkaran = mo.hitung_keliling_lingkaran(5)
print(f"Keliling lingkaran dengan jari-jari 5 adalah {keliling_lingkaran:,.2f}")
suhu_celsius = 25
suhu_fahrenheit = konversi_suhu_celsius_fahrenheit(suhu_celsius)
print(f"{suhu_celsius} derajat Celsius sama dengan {suhu_fahrenheit} derajat Fahrenheit")
suhu_kelvin = konversi_suhu_celsius_kelvin(suhu_celsius)
print(f"{suhu_celsius} derajat Celsius sama dengan {suhu_kelvin} derajat Kelvin")
