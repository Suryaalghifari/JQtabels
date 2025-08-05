$(function () {
	// data
	const source = {
		datatype: "json",
		datafields: [
			{ name: "id", type: "string" },
			{ name: "peering", type: "string" },
			{ name: "location", type: "string" },
			{ name: "interface", type: "string" },
			{ name: "pop_site", type: "string" },
			{ name: "rrd_path", type: "string" },
			{ name: "rrd_alias", type: "string" },
			{ name: "rrd_status", type: "string" },
			{ name: "Capacity", type: "string" }, // <--- FIX INI!
			{ name: "service", type: "string" },
		],

		url: base_url + "index.php/api/services_get", // API endpoint ambil data services
	};
	const dataAdapter = new $.jqx.dataAdapter(source);

	// --- Init Grid ---
	$("#jqxgrid").jqxGrid({
		width: "100%",
		height: 600,
		theme: "ui-redmond",
		source: dataAdapter,
		pageable: true,
		pagesizeoptions: ["5", "10", "20", "50", "100", "99999"],
		pagesize: 20,
		sortable: true,
		filterable: true,
		editable: true,
		columnsresize: true,
		selectionmode: "checkbox",
		showtoolbar: true,
		rendertoolbar: function (toolbar) {
			const container = $("<div style='margin: 5px;'></div>");
			const addButton = $("<button>Tambah Data</button>");
			const deleteButton = $("<button>Hapus Data</button>");
			container.append(addButton, deleteButton);
			toolbar.append(container);

			addButton.on("click", handleAddRow);
			deleteButton.on("click", handleDeleteRows);
		},
		columns: [
			{
				text: "No",
				width: 50,
				editable: false,
				align: "center",
				textalign: "center",
				cellsrenderer: function (row) {
					return `<div style="text-align:center; width:100%;">${row + 1}</div>`;
				},
			},

			{
				text: "ID",
				datafield: "id",
				editable: false,
				width: 200,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "Peering",
				datafield: "peering",
				width: 200,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "Location",
				datafield: "location",
				width: 180,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "Interface",
				datafield: "interface",
				width: 800,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "POP",
				datafield: "pop_site", // pengganti "pop"
				width: 150,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "RRD Path",
				datafield: "rrd_path",
				width: 400,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "RRD Alias",
				datafield: "rrd_alias",
				width: 350,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "RRD Status",
				datafield: "rrd_status",
				width: 125,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "Capacity",
				datafield: "Capacity",
				width: 150,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "Service",
				datafield: "service",
				width: 80,
				align: "center",
				cellsalign: "center",
			},
			{
				text: "Directory",
				editable: false,
				width: 100,
				align: "center",
				cellsrenderer: function (row, column, value) {
					const rowData = $("#jqxgrid").jqxGrid("getrowdata", row);
					return `<button class="btn-directory" data-id="${rowData.id}" style="display:block; margin:0 auto;">📂</button>`;
				},
			},
		],
	});

	// Handler Tambah Row
	function handleAddRow() {
		// Cek apakah sudah ada row kosong yang belum disave
		const rows = $("#jqxgrid").jqxGrid("getrows");
		const hasEmpty = rows.some(
			(r) => !r.peering && !r.location && !r.interface && !r.pop_site
		);
		if (hasEmpty) {
			// Sudah ada baris kosong, jangan tambah lagi
			return;
		}
		// Tambah row kosong lokal
		const newrow = {
			id: "",
			peering: "",
			location: "",
			interface: "",
			pop_site: "",
			rrd_path: "",
			rrd_alias: "",
			rrd_status: "",
			Capacity: "",
			service: "",
		};
		// Gunakan addrow dengan mode 'first' agar muncul di atas page aktif
		$("#jqxgrid").jqxGrid("addrow", null, newrow, "first");
		// Mulai edit di cell pertama
		$("#jqxgrid").jqxGrid("begincelledit", 0, "peering");
	}

	function handleDeleteRows() {
		const selectedIndexes = $("#jqxgrid").jqxGrid("getselectedrowindexes");
		if (!selectedIndexes.length) {
			alert("Pilih data yang mau dihapus (centang di kiri)!");
			return;
		}
		const idsToDelete = selectedIndexes
			.map((idx) => $("#jqxgrid").jqxGrid("getrowdata", idx)?.id)
			.filter((id) => !!id);

		if (!idsToDelete.length) {
			alert("Tidak ada data valid untuk dihapus!");
			return;
		}
		if (confirm("Yakin hapus " + idsToDelete.length + " data ini?")) {
			let successCount = 0,
				failCount = 0;
			idsToDelete.forEach((id, idx) => {
				$.ajax({
					url: base_url + "index.php/api/services_delete/" + id, // API endpoint to delete product
					type: "DELETE",
					dataType: "json",
					success: (response) => {
						if (response.success) successCount++;
						else failCount++;
						if (idx === idsToDelete.length - 1) {
							$("#jqxgrid").jqxGrid("updatebounddata");
							alert(
								successCount +
									" data berhasil dihapus, " +
									failCount +
									" gagal."
							);
						}
					},
					error: () => {
						failCount++;
						if (idx === idsToDelete.length - 1) {
							$("#jqxgrid").jqxGrid("updatebounddata");
							alert(
								successCount +
									" data berhasil dihapus, " +
									failCount +
									" gagal."
							);
						}
					},
				});
			});
		}
	}

	// directory map handler by product ID
	$(document).on("click", ".btn-directory", function (e) {
		e.preventDefault();
		e.stopPropagation();
		const id = $(this).data("id");
		showDirectoryPopup(id);
	});

	$("#jqxgrid").on("pagesizechanged", function (event) {
		const args = event.args;
		const newPageSize = args.pagesize;
		const totalRows = $("#jqxgrid").jqxGrid("getdatainformation").rowscount;
		if (newPageSize === "All" || newPageSize === 0 || newPageSize === "0") {
			$("#jqxgrid").jqxGrid({ pagesize: totalRows });
		}
	});

	$("#jqxgrid").on("cellendedit", function (event) {
		const { datafield, rowindex, value, oldvalue } = event.args;
		const rowdata = $("#jqxgrid").jqxGrid("getrowdata", rowindex);

		rowdata[datafield] = value;
		if (value === oldvalue) {
			return;
		}

		if ((!rowdata.id || rowdata.id === "") && !rowdata.peering) {
			setTimeout(() => {
				$("#jqxgrid").jqxGrid("begincelledit", rowindex, "peering");
			}, 10);
			alert("Field berikut wajib diisi: peering");
			return;
		}

		// add data baru
		if ((!rowdata.id || rowdata.id === "") && rowdata.peering) {
			$.ajax({
				url: base_url + "index.php/api/services_add", // API endpoint to add new product
				type: "POST",
				data: rowdata,
				dataType: "json",
				success: function (response) {
					if (response.success) {
						alert(
							"Data berhasil ditambah! Data baru dapat dilihat di bagian bawah tabel."
						);
						$("#jqxgrid").jqxGrid("updatebounddata");
					} else {
						alert("Gagal tambah data: " + response.message);
					}
				},
				error: function (xhr, status, error) {
					alert("Terjadi error: " + error + "\n" + xhr.responseText);
				},
			});
			return;
		}

		//  update data
		if (rowdata.id) {
			$.ajax({
				url: base_url + "index.php/api/services_update/" + rowdata.id, // API endpoint to update product
				type: "PUT",
				data: JSON.stringify(rowdata),
				dataType: "json",
				success: function (response) {
					if (response.success) {
						alert("Data berhasil diupdate!");
					} else {
						alert("Gagal update data: " + response.message);
					}
				},
				error: function (xhr, status, error) {
					alert("Terjadi error update: " + error + "\n" + xhr.responseText);
				},
			});
		}
	});
	window.showDirectoryPopup = function (id) {
		$.ajax({
			url: base_url + "index.php/api/services_directory/" + id, // API endpoint to get directory by product ID
			type: "GET",
			dataType: "json",
			success: function (response) {
				if (response.success && response.rrd_path) {
					Swal.fire({
						title: "Path Directory",
						html: `<ul style="text-align:center; list-style:none; padding-left:0;">
                               <li><strong>RRD Path:</strong><br/><code>${response.rrd_path}</code></li>
                               <li><strong>RRD Alias:</strong><br/><code>${response.rrd_alias}</code></li>
                           </ul>`,
						width: 600,
						showConfirmButton: true,
						confirmButtonText: "Tutup",
					});
				} else {
					Swal.fire("Tidak ada directory/aksi untuk produk ini.");
				}
			},
			error: function () {
				Swal.fire("Gagal ambil directory dari server.");
			},
		});
	};
});
