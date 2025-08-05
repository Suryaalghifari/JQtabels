$(function () {
	// data
	const source = {
		datatype: "json",
		datafields: [
			{ name: "id", type: "number" },
			{ name: "peering", type: "string" },
			{ name: "location", type: "string" },
			{ name: "interface", type: "string" },
			{ name: "pop_site", type: "string" },
			{ name: "rrd_path", type: "string" },
			{ name: "rrd_alias", type: "string" },
			{ name: "rrd_status", type: "string" },
			{ name: "Capacity", type: "number" },
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
				datafield: "no",
				width: 50,
				editable: false,
				align: "center",
				textalign: "center",
				cellsrenderer: function (row) {
					return `<div style="text-align:center; width:100%;">${row + 1}</div>`;
				},
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
				datafield: "id",
				editable: false,
				width: 100,
				align: "center",
				cellsrenderer: (row, column, value) =>
					`<button class="btn-directory" data-id="${value}" style="display:block; margin:0 auto;">📂</button>`,
			},
		],
	});

	// Handler Tambah Row
	function handleAddRow() {
		const newrow = {
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
		$("#jqxgrid").jqxGrid("addrow", null, newrow);
		const datainfo = $("#jqxgrid").jqxGrid("getdatainformation");
		const lastrow = datainfo.rowscount - 1;
		$("#jqxgrid").jqxGrid("begincelledit", lastrow, "peering");
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

	// Fungsi showDirectoryPopup by product ID
	window.showDirectoryPopup = function (id) {
		const dirs = directoryMap[id] || [];
		if (!dirs.length) {
			Swal.fire("Tidak ada directory/aksi untuk produk ini.");
			return;
		}
		let html =
			'<ul style="text-align:center; list-style:none; padding-left:0;">';
		dirs.forEach((d) => {
			html += `<li><strong>${d.label}</strong>:<br/><code>${d.url}</code></li>`;
		});
		html += "</ul>";
		Swal.fire({
			title: "Path Directory",
			html,
			width: 600,
			showConfirmButton: true,
			confirmButtonText: "Tutup",
		});
	};

	$("#jqxgrid").on("pagesizechanged", function (event) {
		const args = event.args;
		const newPageSize = args.pagesize;
		const totalRows = $("#jqxgrid").jqxGrid("getdatainformation").rowscount;
		if (newPageSize === "All" || newPageSize === 0 || newPageSize === "0") {
			$("#jqxgrid").jqxGrid({ pagesize: totalRows });
		}
	});

	// Logic Add
	$("#jqxgrid").on("cellendedit", function (event) {
		const rowindex = event.args.rowindex;
		const rowdata = $("#jqxgrid").jqxGrid("getrowdata", rowindex);
		const kurang = !rowdata["peering"];

		if ((!rowdata.id || rowdata.id === "") && kurang) {
			setTimeout(() => {
				$("#jqxgrid").jqxGrid("begincelledit", rowindex, "peering");
			}, 10);
			alert("Field berikut wajib diisi: peering");
			return;
		}

		if ((!rowdata.id || rowdata.id === "") && !kurang) {
			rowdata.quantity = !isNaN(rowdata.quantity)
				? parseInt(rowdata.quantity)
				: 0;
			rowdata.unit_price = !isNaN(rowdata.unit_price)
				? parseInt(rowdata.unit_price)
				: 0;
			rowdata.total_price = rowdata.quantity * rowdata.unit_price;
			$.ajax({
				url: base_url + "index.php/api/services_add", // API endpoint to add product
				type: "POST",
				data: rowdata,
				dataType: "json",
				success: function (response) {
					if (response.success) {
						alert("Data berhasil ditambah!");
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

		// Jika update
		if (rowdata.id) {
			rowdata.quantity = !isNaN(rowdata.quantity)
				? parseInt(rowdata.quantity)
				: 0;
			rowdata.unit_price = !isNaN(rowdata.unit_price)
				? parseInt(rowdata.unit_price)
				: 0;
			rowdata.total_price = rowdata.quantity * rowdata.unit_price;
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
});
