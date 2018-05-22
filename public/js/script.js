$(document).ready(function(){
$('#send-predict').on('click',predictWebsite);
$('.close-btn').on('click',function(e){
e.preventDefault();
$(this).parent().css('display','none');
})
});

var predictWebsite = function(e){
  e.preventDefault();
  $('.predictor-loader').css('display','block');
  $('.predictor-form').css('display','none');
  var input = $('#input-predict').val();
  $.get('/api/guess-tech/'+input)
            .done(function(results){
              $('.predictor-loader').css('display','none');
                  $('.predictor-url').text('I think https://www.'+input + ' is built in:')
                   $('.predictor-cms').text(results.cms);
                   $('.predictor-prob').text('and I\'m '+results.prob +'% sure about that.')
                })    ;            
          
}