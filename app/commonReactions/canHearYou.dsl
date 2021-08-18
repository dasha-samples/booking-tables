library

digression can_hear_you
{
        conditions { on #messageHasAnyIntent(digression.can_hear_you.triggers) priority -100; }
        var triggers = ["can_you_hear_me"];
        var responses: Phrases[] = ["i_can_hear_you"];
        do
        {
                for (var item in digression.can_hear_you.responses)
                {
                        #say(item,{ 
                persons_number: $persons_number, 
                plural: $plural, 
                booking_time: $booking_time, 
                user_phone: $user_phone, 
                user_name: $user_name 
            }, repeatMode: "ignore");
                }
                return;
        }
        transitions
        {
        }
}
