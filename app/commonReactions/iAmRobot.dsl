library

digression i_am_robot
{
    conditions { on #messageHasAnyIntent(digression.i_am_robot.triggers); }
    var triggers = ["are_you_a_robot"];
    var responses: Phrases[] = ["yes_i_am_a_robot"];
    do
    {
        for (var item in digression.i_am_robot.responses)
        {
            #say(item,
            { 
                persons_number: $persons_number, 
                plural: $plural, 
                booking_time: $booking_time, 
                user_phone: $user_phone, 
                user_name: $user_name 
            }, repeatMode: "ignore");
        }

        wait *;
                #repeat(accuracy: "short");
    }
    transitions
    {
        
    }
}
