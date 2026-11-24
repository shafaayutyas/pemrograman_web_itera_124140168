
from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest

from .. import models


@view_config(route_name='mahasiswa_list', renderer='json')
def mahasiswa_list(request):
    """Menampilkan seluruh data mahasiswa."""
    dbsession = request.dbsession
    mahasiswa = dbsession.query(models.Mahasiswa).all()

    return {
        'status': 'success',
        'data': [m.to_dict() for m in mahasiswa]
    }


@view_config(route_name='mahasiswa_detail', renderer='json')
def mahasiswa_detail(request):
    """Menampilkan detail mahasiswa berdasarkan ID."""
    dbsession = request.dbsession
    mahasiswa_id = int(request.matchdict['id'])

    mahasiswa = dbsession.query(models.Mahasiswa).filter_by(
        id=mahasiswa_id
    ).first()

    if mahasiswa is None:
        raise HTTPNotFound(
            json_body={
                'status': 'error',
                'message': 'Mahasiswa tidak ditemukan'
            }
        )

    return {
        'status': 'success',
        'data': mahasiswa.to_dict()
    }


@view_config(route_name='mahasiswa_create', renderer='json')
def mahasiswa_create(request):
    """Menambahkan data mahasiswa baru."""
    try:
        data = request.json_body
    except (ValueError, TypeError):
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'Format JSON tidak valid'
            }
        )

    required_fields = ['nim', 'nama', 'jurusan']

    for field in required_fields:
        if not data.get(field):
            raise HTTPBadRequest(
                json_body={
                    'status': 'error',
                    'message': f'Field {field} wajib diisi'
                }
            )

    existing = request.dbsession.query(
        models.Mahasiswa
    ).filter_by(nim=data['nim']).first()

    if existing:
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'NIM sudah terdaftar'
            }
        )

    from datetime import date

    tanggal_lahir = data.get('tanggal_lahir')
    if tanggal_lahir:
        try:
            tanggal_lahir = date.fromisoformat(tanggal_lahir)
        except (ValueError, TypeError):
            raise HTTPBadRequest(
                json_body={
                    'status': 'error',
                    'message': 'Format tanggal_lahir harus YYYY-MM-DD'
                }
            )

    mahasiswa = models.Mahasiswa(
        nim=data['nim'],
        nama=data['nama'],
        jurusan=data['jurusan'],
        tanggal_lahir=tanggal_lahir,
        alamat=data.get('alamat')
    )

    request.dbsession.add(mahasiswa)
    request.dbsession.flush()

    return {
        'status': 'success',
        'message': 'Mahasiswa berhasil ditambahkan',
        'data': mahasiswa.to_dict()
    }


@view_config(route_name='mahasiswa_update', renderer='json')
def mahasiswa_update(request):
    """Memperbarui data mahasiswa."""
    dbsession = request.dbsession
    mahasiswa_id = int(request.matchdict['id'])

    mahasiswa = dbsession.query(models.Mahasiswa).filter_by(
        id=mahasiswa_id
    ).first()

    if mahasiswa is None:
        raise HTTPNotFound(
            json_body={
                'status': 'error',
                'message': 'Mahasiswa tidak ditemukan'
            }
        )

    try:
        data = request.json_body
    except (ValueError, TypeError):
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'Format JSON tidak valid'
            }
        )

    if 'nim' in data and not data['nim']:
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'NIM tidak boleh kosong'
            }
        )

    if 'nim' in data and data['nim'] != mahasiswa.nim:
        existing = dbsession.query(models.Mahasiswa).filter_by(
            nim=data['nim']
        ).first()

        if existing:
            raise HTTPBadRequest(
                json_body={
                    'status': 'error',
                    'message': 'NIM sudah digunakan mahasiswa lain'
                }
            )

    for field in ['nim', 'nama', 'jurusan', 'alamat']:
        if field in data:
            setattr(mahasiswa, field, data[field])

    if 'tanggal_lahir' in data:
        from datetime import date

        try:
            mahasiswa.tanggal_lahir = (
                date.fromisoformat(data['tanggal_lahir'])
                if data['tanggal_lahir'] else None
            )
        except (ValueError, TypeError):
            raise HTTPBadRequest(
                json_body={
                    'status': 'error',
                    'message': 'Format tanggal_lahir harus YYYY-MM-DD'
                }
            )

    dbsession.flush()

    return {
        'status': 'success',
        'message': 'Data mahasiswa berhasil diperbarui',
        'data': mahasiswa.to_dict()
    }


@view_config(route_name='mahasiswa_delete', renderer='json')
def mahasiswa_delete(request):
    """Menghapus data mahasiswa."""
    dbsession = request.dbsession
    mahasiswa_id = int(request.matchdict['id'])

    mahasiswa = dbsession.query(models.Mahasiswa).filter_by(
        id=mahasiswa_id
    ).first()

    if mahasiswa is None:
        raise HTTPNotFound(
            json_body={
                'status': 'error',
                'message': 'Mahasiswa tidak ditemukan'
            }
        )

    dbsession.delete(mahasiswa)

    return {
        'status': 'success',
        'message': 'Mahasiswa berhasil dihapus'
    }
