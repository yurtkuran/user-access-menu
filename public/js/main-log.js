$(document).ready(function () {

    $('#datatable').DataTable( {
        "ajax": {
            // "url" : "https://jsonplaceholder.typicode.com/todos?_limit=10",
            "url" : "./logs/data",
            "dataSrc": ""
         },
         columns : [
            { "data"  : "type",
              "width" : "5%" },
            { "data"  : "createdAt",
              "width" : "35%",
              "render": function (data, type, row) {
                  return moment(data).local().format('YYYY-MM-DD, HH:mm:ss');
              }
            },
            { "data"  : "user.0.firstName",
              "render": function (data, type, row) { 
                  if(row.user[0]){
                    return (row.user[0].lastName+', '+row.user[0].firstName);  
                  }
              },
              "defaultContent": "<i>Not set</i>"
            },
        ],
        columnDefs: [
            { className: "text-center", targets: [0, 1] },
            { className: "text-left pl-4",   targets: [2] },
        ],
        order      : [[1, 'desc']],
        searching  : false,
        pagingType : "full"
        
    });
});