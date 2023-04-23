$(document).ready(function () {
    function loadTableData() {
        $.ajax({
            url: "/load_table_data",
            method: "GET",
            contentType: "application/json",
            success: function (response) {
                if (response.success) {
                    const tableData = response.data;
                    tableData.forEach(function (rowData) {
                        const newRow = `
                        <tr>
                            <td>${rowData.date}</td>
                            <td>${rowData.response_code}</td>
                            <td>${rowData.model}</td>
                            <td>${rowData.prompt_tokens}</td>
                            <td>${rowData.completion_tokens}</td>
                            <td>${rowData.total_tokens}</td>
                            <td>
                                <button class="btn btn-primary btn-sm show-details">+</button>
                            </td>
                        </tr>
                        <tr class="details-row" style="display:none;">
                            <td colspan="7">
                                <pre>${rowData.result}</pre>
                            </td>
                        </tr>
                        `;
                        $("#results-table tbody").append(newRow);
                    });
                } else {
                    toastr.error("Failed to load table data");
                }
            },
            error: function () {
                toastr.error("Failed to load table data");
            }
        });
    };
    // Load saved table data
    loadTableData();
    $('#prompt-form').submit(function (event) {
        event.preventDefault();

        const prompt = $('#prompt').val();
        $.post('/', { prompt: prompt }, function (data) {
            $('#result').text(data.result);

            // Create a new row for the results table
            const newRow = `
            <tr>
                <td>${data.date}</td>
                <td>${data.response_code}</td>
                <td>${data.model}</td>
                <td>${data.prompt_tokens}</td>
                <td>${data.completion_tokens}</td>
                <td>${data.total_tokens}</td>
                <td>
                    <button class="btn btn-primary btn-sm show-details">+</button>
                </td>
            </tr>
            <tr class="details-row" style="display:none;">
                <td colspan="7">
                    <pre>${data.result}</pre>
                </td>
            </tr>
            `;

            // Append the new row to the table
            $("#results-table tbody").append(newRow);

            // Save table data to the server
            saveTableData();

            toastr.success("Result displayed on the page.");
        }).fail(function (xhr) {
            $('#result').text('Error: ' + xhr.responseJSON.error);
        });
    });

    // Toggle details row
    $(document).on("click", ".show-details", function () {
        const detailsRow = $(this).closest("tr").next(".details-row");
        detailsRow.toggle();
        $(this).text(detailsRow.is(":visible") ? "-" : "+");
    });

    function saveTableData() {
        const tableData = [];
        $("#results-table tbody tr:not(.details-row)").each(function () {
            const rowData = {};
            $(this).find("td").each(function (index) {
                const columnData = $(this).text();
                if (index === 0) {
                    rowData.date = columnData;
                } else if (index === 1) {
                    rowData.response_code = columnData;
                } else if (index === 2) {
                    rowData.model = columnData;
                } else if (index === 3) {
                    rowData.prompt_tokens = parseInt(columnData);
                } else if (index === 4) {
                    rowData.completion_tokens = parseInt(columnData);
                } else if (index === 5) {
                    rowData.total_tokens = parseInt(columnData);
                }
            });
            tableData.push(rowData);
        });
    
        $.ajax({
            url: "/save_table_data",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(tableData),
            success: function (response) {
                if (response.success) {
                    toastr.info("Table data saved to table_content.json");
                } else {
                    toastr.error("Failed to save table data");
                }
            },
            error: function () {
                toastr.error("Failed to save table data");
            }
        });
    }
    
});
