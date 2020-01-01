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
        
        // ajax for deleting user
        $.ajax({    
            type: 'DELETE',
            url: '/sectors/' + id,
            success: (response) => {
                if (response == 'sameUser') {
                    $(location).attr('href', '/users/listusers#');
                    $("#listMessage").html("\
                        <div class='alert alert-danger alert-dismissible fade show' role='alert'>\
                            Deleting current user not allowed\
                            <button type='button' class='close' data-dismiss='alert' aria-label='Close'>\
                                <span aria-hidden='true'>&times;</span>\
                            </button>\
                        </div>\
                    ");
                } else {
                    $(location).attr('href', '/sectors/list');
                }
            },
            error: (err) => {
                console.log('an error occured');
                console.log(err);
            }
        });
    });

});