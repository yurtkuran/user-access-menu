$(document).ready(function () {

    // ajax for deleting employee
    $('.delete-user').on('click', (e) => {
        $target = $(e.target);
        const id = $target.attr('data-id');

        if (confirm('Are you sure to delete this record?')) {
            $.ajax({
                type: 'DELETE',
                url: '/users/' + id,
                success: function (response) {
                    window.location.href = '/users/listusers';
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }

    });
});