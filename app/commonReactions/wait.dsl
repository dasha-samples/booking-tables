library
block @wait(duration: number): boolean {
    context {
        timer: string = "";
    }
    start node @wait {
        do {
            #waitingMode($duration);
            set $timer = #startTimer($duration);
            wait { @return };
        }
        transitions {
            @return: goto @return on #isTimerExpired($timer) tags: ontick;
        }
    }
    node @return {
        do {
            return true;
        }
    }
}
digression @wait
{
    conditions { on #messageHasAnyIntent(digression.@wait.triggers)  priority 900; }
    var triggers = ["wait", "wait_for_another_person"];
    var responses: Phrases[] = ["i_will_wait"];
    var duration: number = 2500;
    do
    {
        for (var item in digression.@wait.responses)
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
        blockcall @wait(digression.@wait.duration);
        #waitingMode(duration: 60000);
        return;
    }
    transitions
    {
    }
}

