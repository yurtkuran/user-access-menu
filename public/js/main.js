$(document).ready(function () {
    var userID;

    $('#userDeleteModal').on('show.bs.modal', (e) => {
        userID = $(e.relatedTarget).data('id');
        user   = $(e.relatedTarget).data('user');

        var modal = $(this);
        modal.find('.modal-text').text(user);
    });

    $('#confirm-delete-button').on('click', () => {
        $('#myModal').modal('hide');

        // ajax for deleting user
        $.ajax({    
            type: 'DELETE',
            url: '/users/' + userID,
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
                    $(location).attr('href', '/users/listusers');
                }
            },
            error: (err) => {
                console.log('an error occured');
                console.log(err);
            }
        });
    });

});