$(document).ready(function () {
    var id;

    $('#deleteModal').on('show.bs.modal', (e) => {
        id   = $(e.relatedTarget).data('id');
        text = $(e.relatedTarget).data('text');
        
        var modal = $(this);
        modal.find('.modal-text').text(text);
    });
    
    $('#confirm-delete-button').on('click', () => {
        $('#myModal').modal('hide');
        
        // ajax for deleting stock
        $.ajax({    
            type: 'DELETE',
            url: '/stocks/' + id,
            success: (response) => {
                $(location).attr('href', '/stocks/list');
            },
            error: (err) => {
                console.log('an error occured');
                console.log(err);
            }
        });
    });

});