<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * @property Output $output
 * @property CI_Input $input
 * @property Telkom_ref_service_model $Telkom_ref_service_model
 */

class Api extends CI_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->model('Telkom_ref_service_model'); 
    }

    // GET: Ambil semua data
      public function services_get()
{
    $data = $this->Telkom_ref_service_model->get_all();

    foreach ($data as &$row) {
    // Mapping ulang
    $row['pop_site'] = isset($row['pop']) ? $row['pop'] : "";
    unset($row['pop']);
}
unset($row);

    $this->output
        ->set_content_type('application/json')
        ->set_output(json_encode($data));
}

    // POST: Tambah data baru
    public function services_add()
    {
        $data = $this->input->post();

        // Kolom yang wajib diisi bisa kamu atur, misal peering harus diisi
        if (empty($data['peering'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Peering wajib diisi'
            ]);
            return;
        }

        $id = $this->Telkom_ref_service_model->insert($data);
        if ($id) {
            echo json_encode(['success' => true, 'id' => $id]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal insert data']);
        }
    }

    // PUT: Update data by ID
    public function services_update($id = null)
    {
        $data = json_decode(file_get_contents('php://input'), true); 

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID wajib ada']);
            return;
        }

        if (!$data || !is_array($data)) {
            echo json_encode(['success' => false, 'message' => 'Data kosong, tidak ada yang diupdate']);
            return;
        }

        $updated = $this->Telkom_ref_service_model->update($id, $data);
        if ($updated) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal update data']);
        }
    }
    
    // DELETE: Hapus data by ID
    public function services_delete($id = null)
    {
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'ID wajib ada']);
            return;
        }
        $deleted = $this->Telkom_ref_service_model->delete($id);
        if ($deleted) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Gagal hapus data']);
        }
    }
}
