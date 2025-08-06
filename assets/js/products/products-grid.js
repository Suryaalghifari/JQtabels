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
			{ name: "Capacity", type: "string" },
			{ name: "service", type: "string" },
		],

		url: base_url + "index.php/api/services_get", // API endpoint ambil data services
	};
	const dataAdapter = new $.jqx.dataAdapter(source);

	$("#jqxgrid").jqxGrid({
		width: "100%",
		height: "100%",
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
			const addButton = $(
				"<button class='btn-action'><i class='bi bi-plus-circle'></i> Tambah Data</button>"
			);
			const deleteButton = $(
				"<button class='btn-action'><i class='bi bi-trash'></i> Hapus Data</button>"
			);
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
				//hidden: true,
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
		const rows = $("#jqxgrid").jqxGrid("getrows");
		const hasEmpty = rows.some(
			(r) => !r.peering && !r.location && !r.interface && !r.pop_site
		);
		if (hasEmpty) {
			return;
		}

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

		$("#jqxgrid").jqxGrid("addrow", null, newrow, "first");
		$("#jqxgrid").jqxGrid("begincelledit", 0, "peering");
	}

	function handleDeleteRows() {
		const selectedIndexes = $("#jqxgrid").jqxGrid("getselectedrowindexes");
		if (!selectedIndexes.length) {
			showNotif({
				icon: "warning",
				title: "Pilih data yang mau dihapus (centang di kiri)!",
				position: "center",
				showConfirmButton: true,
				confirmButtonText: "Tutup",
				timer: null,
			});
			return;
		}
		const idsToDelete = selectedIndexes
			.map((idx) => $("#jqxgrid").jqxGrid("getrowdata", idx)?.id)
			.filter((id) => !!id);

		if (!idsToDelete.length) {
			showNotif({
				icon: "warning",
				title: "Tidak ada data valid untuk dihapus!",
				position: "center",
				showConfirmButton: true,
				confirmButtonText: "Tutup",
				timer: null,
			});
			return;
		}

		Swal.fire({
			title: "Yakin hapus?",
			text: `Yakin hapus ${idsToDelete.length} data ini?`,
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Ya, hapus!",
			cancelButtonText: "Batal",
			position: "center",
		}).then((result) => {
			if (result.isConfirmed) {
				let successCount = 0,
					failCount = 0;
				idsToDelete.forEach((id, idx) => {
					$.ajax({
						url: base_url + "index.php/api/services_delete/" + id,
						type: "DELETE",
						dataType: "json",
						success: (response) => {
							if (response.success) successCount++;
							else failCount++;
							if (idx === idsToDelete.length - 1) {
								$("#jqxgrid").jqxGrid("updatebounddata");
								showNotif({
									icon: "success",
									title: "Hapus Data",
									text: `${successCount} data berhasil dihapus, ${failCount} gagal.`,
									position: "center",
									toast: true,
									timer: 2200,
								});
							}
						},
						error: () => {
							failCount++;
							if (idx === idsToDelete.length - 1) {
								$("#jqxgrid").jqxGrid("updatebounddata");
								showNotif({
									icon: "error",
									title: "Error",
									text: `${successCount} data berhasil dihapus, ${failCount} gagal.`,
									position: "top-end",
									toast: true,
									timer: 2200,
								});
							}
						},
					});
				});
			}
		});
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
						showNotif({
							icon: "success",
							title: "Data berhasil ditambah!",
							text: "Data baru dapat dilihat di bagian bawah tabel.",
							position: "center",
							toast: true,
							timer: 2000,
						});
						$("#jqxgrid").jqxGrid("updatebounddata");
					} else {
						showNotif({
							icon: "error",
							title: "Gagal tambah data",
							text: response.message || "Unknown error",
							position: "center",
							showConfirmButton: true,
							confirmButtonText: "Tutup",
							timer: null,
						});
					}
				},
				error: function (xhr, status, error) {
					showNotif({
						icon: "error",
						title: "Terjadi error!",
						html: `<div style="text-align:left"><b>${error}</b><hr><pre style="max-width:300px;white-space:pre-wrap;">${xhr.responseText}</pre></div>`,
						position: "center",
						showConfirmButton: true,
						confirmButtonText: "Tutup",
						timer: null,
					});
				},
			});
			return;
		}

		//  update data
		if (rowdata.id) {
			$.ajax({
				url: base_url + "index.php/api/services_update/" + rowdata.id,
				type: "PUT",
				data: JSON.stringify(rowdata),
				dataType: "json",
				success: function (response) {
					if (response.success) {
						showNotif({
							icon: "success",
							title: "Berhasil!",
							text: "Data berhasil diupdate!",
							toast: true,
							timer: 3000,
							position: "center",
						});
					} else {
						showNotif({
							icon: "error",
							title: "Gagal update data!",
							text: response.message || "Unknown error",
						});
					}
				},
				error: function (xhr, status, error) {
					showNotif({
						icon: "error",
						title: "Terjadi error update!",
						html: `<div style="text-align:left">
                        <b>${error}</b>
                        <hr>
                        <pre style="max-width:300px;white-space:pre-wrap;">${xhr.responseText}</pre>
                       </div>`,
					});
				},
			});
		}
	});
	window.showDirectoryPopup = function (id) {
		$.ajax({
			url: base_url + "index.php/api/services_directory/" + id,
			type: "GET",
			dataType: "json",
			success: function (response) {
				if (response.success && response.rrd_path) {
					showNotif({
						icon: "info",
						title: "Path Directory",
						html: `
                        <ul style="text-align:center; list-style:none; padding-left:0;">
                            <li><strong>RRD Path:</strong><br/><code>${response.rrd_path}</code></li>
                        </ul>
                    `,
						width: 400,
						position: "center",
						showConfirmButton: true,
						confirmButtonText: "Tutup",
						timer: null,
					});
				} else {
					showNotif({
						icon: "warning",
						title: "Tidak ada directory/aksi untuk produk ini.",
						position: "center",
						width: 350,
						showConfirmButton: true,
						confirmButtonText: "Tutup",
						timer: null,
					});
				}
			},
			error: function () {
				showNotif({
					icon: "error",
					title: "Gagal ambil directory dari server.",
					position: "center",
					width: 350,
					showConfirmButton: true,
					confirmButtonText: "Tutup",
					timer: null,
				});
			},
		});
	};
});
