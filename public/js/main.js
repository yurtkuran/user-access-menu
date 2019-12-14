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
                window.location.href = '/users/listusers';
            },
            error: (err) => {
                console.log(err);
            }
        });
    });

});