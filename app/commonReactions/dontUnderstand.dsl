library
context
{
    output status:string?;
    output serviceStatus:string?;
}

digression dont_understand_hangup_params
{
    conditions { on false; }
    var responses: Phrases[] = ["dont_understand_hangup"];
    var status = "DontUnderstandHangup";
    var serviceStatus = "Done";
    do
    {
    }
    transitions
    {
    }
}

digression dont_understand
{
    conditions { on true priority -1000; }
    var retriesLimit=1;
    var counter=0;
    var resetOnRecognized=false;
  //  var responses: Phrases[] = ["dont_understand"];
    do
    {
        if (digression.dont_understand.counter > digression.dont_understand.retriesLimit)
        {
            goto hangup;
        }
        set digression.dont_understand.counter=digression.dont_understand.counter+1;
        set digression.dont_understand.resetOnRecognized = false;
    //    for (var item in digression.dont_understand.responses)
        {
    //        #say(item, repeatMode: "ignore");
        }
        #repeat(accuracy: "short");
        return;
    }
    transitions
    {
        hangup: goto dont_understand_hangup;
    }
}

preprocessor digression dont_understand_preprocessor
{
    conditions { on true priority 50000; }
    do
    {
        if (digression.dont_understand.resetOnRecognized)
        {
            set digression.dont_understand.counter = 0;
        }
        set digression.dont_understand.resetOnRecognized = true;
        return;
    }
    transitions
    {
    }
}

node dont_understand_hangup
{
    do
    {
        for (var item in digression.dont_understand_hangup_params.responses)
        {
            #say(item,
            { 
                persons_number: $persons_number, 
                plural: $plural, 
                booking_time: $booking_time, 
                user_phone: $user_phone, 
                user_name: $user_name 
            },  repeatMode: "ignore");
        }
        set $status=digression.dont_understand_hangup_params.status;
        set $serviceStatus=digression.dont_understand_hangup_params.serviceStatus;
        exit;
    }
    transitions
    {
    }
}
