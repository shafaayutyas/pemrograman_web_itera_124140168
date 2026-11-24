
import argparse
import sys
from datetime import date

from pyramid.paster import bootstrap, setup_logging
from sqlalchemy.exc import OperationalError

from .. import models


def setup_models(dbsession):
    """
    Add or update models / fixtures in the database.
    """

    # Data awal mahasiswa
    data_mahasiswa = [
        {
            'nim': '12345',
            'nama': 'Budi Santoso',
            'jurusan': 'Teknik Informatika',
            'tanggal_lahir': date(2005, 5, 15),
            'alamat': 'Bandar Lampung',
        },
        {
            'nim': '54321',
            'nama': 'Siti Aminah',
            'jurusan': 'Teknik Informatika',
            'tanggal_lahir': date(2005, 8, 20),
            'alamat': 'Lampung Selatan',
        },
    ]

    # Masukkan mahasiswa jika NIM belum tersedia
    for data in data_mahasiswa:
        mahasiswa = dbsession.query(
            models.Mahasiswa
        ).filter_by(nim=data['nim']).first()

        if mahasiswa is None:
            dbsession.add(models.Mahasiswa(**data))

    
    # Data awal matakuliah
    data_matakuliah = [
        {
            'kode_mk': 'IF101',
            'nama_mk': 'Algoritma dan Pemrograman',
            'sks': 3,
            'semester': 1,
        },
        {
            'kode_mk': 'IF201',
            'nama_mk': 'Struktur Data',
            'sks': 3,
            'semester': 2,
        },
        {
            'kode_mk': 'IF301',
            'nama_mk': 'Kecerdasan Buatan',
            'sks': 3,
            'semester': 5,
        },
    ]

    # Masukkan matakuliah jika kode belum tersedia
    for data in data_matakuliah:
        matakuliah = dbsession.query(
            models.Matakuliah
        ).filter_by(kode_mk=data['kode_mk']).first()

        if matakuliah is None:
            dbsession.add(models.Matakuliah(**data))



def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        'config_uri',
        help='Configuration file, e.g., development.ini',
    )
    return parser.parse_args(argv[1:])


def main(argv=sys.argv):
    args = parse_args(argv)
    setup_logging(args.config_uri)
    env = bootstrap(args.config_uri)

    try:
        with env['request'].tm:
            dbsession = env['request'].dbsession
            setup_models(dbsession)
    except OperationalError:
        print('''
Pyramid is having a problem using your SQL database.
Pastikan database sudah berjalan dan migration Alembic
sudah diterapkan.
        ''')
    finally:
        env['closer']()
