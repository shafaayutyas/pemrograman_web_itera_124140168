"""Kumpulan fungsi operasi geometri dan konversi suhu."""

from math import pi


def hitung_luas_persegi_panjang(panjang: float, lebar: float) -> float:
    """Menghitung luas persegi panjang.

    Args:
        panjang: Panjang persegi panjang.
        lebar: Lebar persegi panjang.

    Returns:
        Luas persegi panjang.
    """
    return panjang * lebar


def hitung_keliling_persegi_panjang(panjang: float, lebar: float) -> float:
    """Menghitung keliling persegi panjang.

    Args:
        panjang: Panjang persegi panjang.
        lebar: Lebar persegi panjang.

    Returns:
        Keliling persegi panjang.
    """
    return 2 * (panjang + lebar)


def hitung_luas_persegi(sisi: float) -> float:
    """Menghitung luas persegi.

    Args:
        sisi: Panjang sisi persegi.

    Returns:
        Luas persegi.
    """
    return sisi ** 2


def hitung_keliling_persegi(sisi: float) -> float:
    """Menghitung keliling persegi.

    Args:
        sisi: Panjang sisi persegi.

    Returns:
        Keliling persegi.
    """
    return sisi * 4


def hitung_luas_lingkaran(jari_jari: float) -> float:
    """Menghitung luas lingkaran.

    Args:
        jari_jari: Panjang jari-jari lingkaran.

    Returns:
        Luas lingkaran.
    """
    return pi * (jari_jari ** 2)


def hitung_keliling_lingkaran(jari_jari: float) -> float:
    """Menghitung keliling lingkaran.

    Args:
        jari_jari: Panjang jari-jari lingkaran.

    Returns:
        Keliling lingkaran.
    """
    return 2 * pi * jari_jari


def konversi_suhu_celsius_fahrenheit(celsius: float) -> float:
    """Mengonversi suhu Celsius menjadi Fahrenheit.

    Args:
        celsius: Suhu dalam derajat Celsius.

    Returns:
        Suhu dalam derajat Fahrenheit.
    """
    return float((celsius * (9 / 5)) + 32)


def konversi_suhu_celsius_kelvin(celsius: float) -> float:
    """Mengonversi suhu Celsius menjadi Kelvin.

    Args:
        celsius: Suhu dalam derajat Celsius.

    Returns:
        Suhu dalam Kelvin.
    """
    return float(celsius + 273.15)
