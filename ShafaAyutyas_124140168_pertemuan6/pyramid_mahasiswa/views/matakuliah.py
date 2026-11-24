from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest

from .. import models


def get_matakuliah(request):
    """Mengambil data matakuliah berdasarkan ID."""
    try:
        matakuliah_id = int(request.matchdict['id'])
    except (ValueError, TypeError):
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'ID matakuliah tidak valid'
            }
        )

    matakuliah = request.dbsession.query(
        models.Matakuliah
    ).filter_by(id=matakuliah_id).first()

    if matakuliah is None:
        raise HTTPNotFound(
            json_body={
                'status': 'error',
                'message': 'Matakuliah tidak ditemukan'
            }
        )

    return matakuliah


def validate_data(data, partial=False):
    """Memvalidasi data matakuliah."""
    if not isinstance(data, dict):
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'Data harus berbentuk JSON object'
            }
        )

    required_fields = ['kode_mk', 'nama_mk', 'sks', 'semester']

    if not partial:
        for field in required_fields:
            if field not in data or data[field] in (None, ''):
                raise HTTPBadRequest(
                    json_body={
                        'status': 'error',
                        'message': f'Field {field} wajib diisi'
                    }
                )

    for field in ['kode_mk', 'nama_mk']:
        if field in data and (
            not isinstance(data[field], str) or not data[field].strip()
        ):
            raise HTTPBadRequest(
                json_body={
                    'status': 'error',
                    'message': f'Field {field} harus berupa teks dan tidak boleh kosong'
                }
            )

    for field in ['sks', 'semester']:
        if field in data:
            value = data[field]

            if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
                raise HTTPBadRequest(
                    json_body={
                        'status': 'error',
                        'message': f'Field {field} harus berupa bilangan bulat positif'
                    }
                )


@view_config(route_name='matakuliah_list', renderer='json')
def matakuliah_list(request):
    """Menampilkan seluruh matakuliah."""
    matakuliah = request.dbsession.query(
        models.Matakuliah
    ).order_by(models.Matakuliah.id).all()

    return {
        'status': 'success',
        'data': [m.to_dict() for m in matakuliah]
    }


@view_config(route_name='matakuliah_detail', renderer='json')
def matakuliah_detail(request):
    """Menampilkan detail matakuliah."""
    matakuliah = get_matakuliah(request)

    return {
        'status': 'success',
        'data': matakuliah.to_dict()
    }


@view_config(route_name='matakuliah_create', renderer='json')
def matakuliah_create(request):
    """Menambahkan matakuliah baru."""
    try:
        data = request.json_body
    except (ValueError, TypeError):
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'Format JSON tidak valid'
            }
        )

    validate_data(data)

    existing = request.dbsession.query(
        models.Matakuliah
    ).filter_by(kode_mk=data['kode_mk'].strip()).first()

    if existing:
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'Kode matakuliah sudah terdaftar'
            }
        )

    matakuliah = models.Matakuliah(
        kode_mk=data['kode_mk'].strip(),
        nama_mk=data['nama_mk'].strip(),
        sks=data['sks'],
        semester=data['semester']
    )

    request.dbsession.add(matakuliah)
    request.dbsession.flush()

    return {
        'status': 'success',
        'message': 'Matakuliah berhasil ditambahkan',
        'data': matakuliah.to_dict()
    }


@view_config(route_name='matakuliah_update', renderer='json')
def matakuliah_update(request):
    """Memperbarui matakuliah."""
    matakuliah = get_matakuliah(request)

    try:
        data = request.json_body
    except (ValueError, TypeError):
        raise HTTPBadRequest(
            json_body={
                'status': 'error',
                'message': 'Format JSON tidak valid'
            }
        )

    validate_data(data, partial=True)

    if 'kode_mk' in data:
        kode_baru = data['kode_mk'].strip()

        existing = request.dbsession.query(
            models.Matakuliah
        ).filter_by(kode_mk=kode_baru).first()

        if existing and existing.id != matakuliah.id:
            raise HTTPBadRequest(
                json_body={
                    'status': 'error',
                    'message': 'Kode matakuliah sudah digunakan'
                }
            )

        matakuliah.kode_mk = kode_baru

    if 'nama_mk' in data:
        matakuliah.nama_mk = data['nama_mk'].strip()

    if 'sks' in data:
        matakuliah.sks = data['sks']

    if 'semester' in data:
        matakuliah.semester = data['semester']

    request.dbsession.flush()

    return {
        'status': 'success',
        'message': 'Matakuliah berhasil diperbarui',
        'data': matakuliah.to_dict()
    }


@view_config(route_name='matakuliah_delete', renderer='json')
def matakuliah_delete(request):
    """Menghapus matakuliah."""
    matakuliah = get_matakuliah(request)

    request.dbsession.delete(matakuliah)

    return {
        'status': 'success',
        'message': 'Matakuliah berhasil dihapus'
    }
