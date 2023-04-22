$(document).ready(function() {
    $('#prompt-form').submit(function(event) {
        event.preventDefault();

        const prompt = $('#prompt').val();
        $.post('/', {prompt: prompt}, function(data) {
            $('#result').text(data);
        }).fail(function(xhr) {
            $('#result').text('Error: ' + xhr.responseJSON.error);
        });
    });
});

