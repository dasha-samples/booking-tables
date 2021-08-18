library

digression sorry_wont_call
{
    conditions 
    {
        on #messageHasAnyIntent(digression.sorry_wont_call.triggers) priority 1010;
    }
    var triggers = ["do_not_call", "you_already_called_me", "wrong_number", "whom_do_you_call", "obscene"];
    var responses: Phrases[] = ["sorry_wont_call"];
    var status = "DontCall";
    var serviceStatus="Done";
    do
    {
        for (var item in digression.sorry_wont_call.responses)
        {
            #say(item,
            { 
                persons_number: $persons_number, 
                plural: $plural, 
                booking_time: $booking_time, 
                user_phone: $user_phone, 
                user_name: $user_name 
            });
        }
        set $status=digression.sorry_wont_call.status;
        set $serviceStatus=digression.sorry_wont_call.serviceStatus;
        set $callBackDetails = #message.originalText;
    
        exit;
    }
    transitions
    {
    }
}
