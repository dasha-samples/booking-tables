import "commonReactions/all.dsl";


context
{
    input phone: string;
    input booking_time: string;
    input user_name: string;
    input user_phone: string;
    input persons_number: string;
    output result:boolean=false;
    amount: string="";
    date_and_time: boolean=false;
    said_phone_number: boolean=false;
    name_or_number: boolean=false;
    said_user_name: boolean=false;
    is_table_booked: boolean=false;
    greeting: boolean=false;
    am_check: boolean=false;
    i_d_like_to_book_a_table: boolean=false;
    no_return: boolean=false;
    plural: string = "";
}

start node root
{
    do
    {
        if (#parseInt($persons_number) > 1)
        {
            set $plural = "s";
        }
        #connectSafe($phone);
        wait *;
    }
    transitions
    {
        transition4: goto AM on true;
        transition5: goto AM on  #messageHasData("numberword") priority 5000;
        transition6: goto AM_check on #messageHasIntent("potential_no_am") priority 5000;
    }
}
node AM_check
{
    do
    {
        set $am_check=true;
        #say("hello");
        wait *;
    }
    
    transitions
    {
        transition0: goto AM on true;
        transition15: goto AM on  #messageHasData("numberword") priority 5000;
    }
}

digression hangup
{
    conditions
    {
        on true tags: onclosed;
    }
    do
    {
        set $status = "user_hang_up";
        exit;
    }
    transitions
    {
    }
}

digression i_d_like_to_book_a_table
{
    conditions
    {
        on #messageHasIntent("no_answering_machine") && !$no_return && !$greeting priority 5000;
    }
    do
    {
        set $i_d_like_to_book_a_table=true;
        set $status="i_d_like_to_book_a_table";
        if ($am_check==false)
        {
            #say("greeting");
        }
        else
        {
            #say("greeting_2");
        }
        set $greeting=true;
        wait *;
    }
}

digression time
{
    conditions
    {
        on #messageHasIntent("what_time") &&$greeting priority 15000;
    }
    do
    {
        set $date_and_time=true;
        set $status="time";
        #say("time",
        {
            persons_number: $persons_number,
            plural: $plural,
            booking_time: $booking_time,
            user_phone: $user_phone,
            user_name: $user_name
        }
        );
        wait *;
    }
}

digression people
{
    conditions
    {
        on #messageHasIntent("how_many_people") &&$greeting priority 15000;
    }
    do
    {
        set $date_and_time=true;
        set $status="people";
        #say("people",
        {
            persons_number: $persons_number,
            plural: $plural,
            booking_time: $booking_time,
            user_phone: $user_phone,
            user_name: $user_name
        }
        );
        wait *;
    }
}

digression people_time
{
    conditions
    {
        on #messageHasSentiment("positive") && $date_and_time==false && $greeting;
        on #messageHasIntent("people_time") priority 16000;
    }
    do
    {
        set $date_and_time=true;
        set $status="people_time";
        if (#messageHasIntent("people_time"))
        {
            #say("time_people_2",
            {
                persons_number: $persons_number,
                plural: $plural,
                booking_time: $booking_time,
                user_phone: $user_phone,
                user_name: $user_name
            }
            );
        }
        else
        {
            #say("time_people",
            {
                persons_number: $persons_number,
                plural: $plural,
                booking_time: $booking_time,
                user_phone: $user_phone,
                user_name: $user_name
            }
            );
        }
        wait *;
    }
}

digression user_name
{
    conditions
    {
        on #messageHasIntent("user_name") priority 15000;
        on #messageHasSentiment("positive") && $name_or_number && $greeting;
    }
    do
    {
        set $name_or_number=false;
        set $status="user_name";
        set $said_user_name=true;
        set $no_return=true;
        set $i_d_like_to_book_a_table=false;
        #say("user_name",
        {
            user_name: $user_name
        }
        );
        wait *;
    }
}

digression phone_number
{
    conditions
    {
        on #messageHasIntent("phone_number") priority 15000;
    }
    do
    {
        set $said_phone_number=true;
        set $status="phone_number";
        set $no_return=true;
        set $i_d_like_to_book_a_table=false;
        #say("user_phone",
        {
            user_phone: $user_phone
        }
        );
        wait *;
    }
}

digression name_or_number
{
    conditions
    {
        on #messageHasSentiment("positive") && $said_user_name==false && $greeting;
    }
    do
    {
        set $name_or_number=true;
        set $status="name_or_number";
        set $no_return=true;
        #say("name_or_number");
        wait *;
    }
}
digression is_table_booked
{
    conditions
    {
        on #messageHasSentiment("positive") && $said_user_name && $greeting  ||  #messageHasSentiment("positive") && $said_phone_number && $greeting priority 10000;
    }
    
    do
    {
        set $i_d_like_to_book_a_table=false;
        set $said_user_name=false;
        set $said_phone_number=false;
        set $is_table_booked=true;
        #say("is_table_booked");
        wait *;
    }
}

digression bye
{
    conditions
    {
        on #messageHasSentiment("positive") && $is_table_booked && $greeting priority 10;
        on #messageHasIntent("table_is_booked") && $said_phone_number priority 15000;
        on #messageHasIntent("table_is_booked") && $said_user_name priority 15000;
    }
    do
    {
        set $status="Booked";
        #say("bye");
        exit;
    }
}

digression haven_t_seat
{
    conditions
    {
        on #messageHasIntent("no_booking") && $greeting priority 16000;
        on #messageHasSentiment("negative") && $is_table_booked ||  #messageHasSentiment("negative") && $i_d_like_to_book_a_table || #messageHasSentiment("negative") && $date_and_time;
    }
    do
    {
        set $status="No booked";
        #say("bye_fail");
        exit;
    }
}
node AM
{
    do
    {
        set $status="Answering_machine_custom";
        exit;
    }
    transitions
    {
    }
}
