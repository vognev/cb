$(function(){
    var $example = $('.example');
    function changeBg(blob) {
        var reader = new FileReader();
        reader.onloadend = function(e) {
            var bg = 'url("' + e.currentTarget.result + '")';
            $example.css({'background-image': bg});
        };
        reader.readAsDataURL(blob);
    }
    $('.hint').cb(changeBg);
});