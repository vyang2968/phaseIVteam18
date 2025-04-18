-- CS4400: Introduction to Database Systems: Monday, March 3, 2025
-- Simple Airline Management System Course Project Mechanics [TEMPLATE] (v0)
-- Views, Functions & Stored Procedures

/* This is a standard preamble for most of our scripts.  The intent is to establish
a consistent environment for the database behavior. */
set global transaction isolation level serializable;
set global SQL_MODE = 'ANSI,TRADITIONAL';
set names utf8mb4;
set SQL_SAFE_UPDATES = 0;

set @thisDatabase = 'flight_tracking';
use flight_tracking;
-- -----------------------------------------------------------------------------
-- stored procedures and views
-- -----------------------------------------------------------------------------
/* Standard Procedure: If one or more of the necessary conditions for a procedure to
be executed is false, then simply have the procedure halt execution without changing
the database state. Do NOT display any error messages, etc. */

-- [_] supporting functions, views and stored procedures
-- -----------------------------------------------------------------------------
/* Helpful library capabilities to simplify the implementation of the required
views and procedures. */
-- -----------------------------------------------------------------------------
drop function if exists leg_time;
delimiter //
create function leg_time (ip_distance integer, ip_speed integer)
	returns time reads sql data
begin
	declare total_time decimal(10,2);
    declare hours, minutes integer default 0;
    set total_time = ip_distance / ip_speed;
    set hours = truncate(total_time, 0);
    set minutes = truncate((total_time - hours) * 60, 0);
    return maketime(hours, minutes, 0);
end //
delimiter ;

-- [1] add_airplane()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new airplane.  A new airplane must be sponsored
by an existing airline, and must have a unique tail number for that airline.
username.  An airplane must also have a non-zero seat capacity and speed. An airplane
might also have other factors depending on it's type, like the model and the engine.  
Finally, an airplane must have a new and database-wide unique location
since it will be used to carry passengers. */
-- -----------------------------------------------------------------------------
drop procedure if exists add_airplane;
delimiter //
create procedure add_airplane (in ip_airlineID varchar(50), in ip_tail_num varchar(50),
	in ip_seat_capacity integer, in ip_speed integer, in ip_locationID varchar(50),
    in ip_plane_type varchar(100), in ip_maintenanced boolean, in ip_model varchar(50),
    in ip_neo boolean)
sp_main: begin
	-- Null check
    if (ip_airlineID is NULL or ip_tail_num is NULL or ip_seat_capacity is NULL or ip_speed is NULL or ip_locationID is NULL)
	-- Ensure that the plane type is valid: Boeing, Airbus, or neither
		or not (ip_plane_type = 'Boeing' OR ip_plane_type = 'Airbus' OR ip_plane_type IS NULL)
    -- Ensure that the type-specific attributes are accurate for the type
		or (ip_plane_type = 'Boeing' and (ip_model is NULL or ip_maintenanced is NULL or ip_neo is not NULL))
        or (ip_plane_type = 'Airbus' and (ip_neo is NULL or ip_model is not NULL or ip_maintenanced is not NULL))
	-- Airline exists
		or not exists (select * from airline where airlineID = ip_airlineID)
    -- Ensure that the airplane and location values are new and unique
		or exists (select * from location where locationID = ip_locationID)
        or exists (select * from airplane where airlineID = ip_airlineID and tail_num = ip_tail_num)
	-- Non-zero seat capacity and speed
		or (ip_seat_capacity <= 0)
        or (ip_speed <= 0)
	then
		leave sp_main;
	end if;
    -- Add airplane and location into respective tables
    insert into location
    values (ip_locationID);
    
	insert into airplane 
    values (ip_airlineID, ip_tail_num, ip_seat_capacity, ip_speed, ip_locationID, ip_plane_type, ip_maintenanced, ip_model, ip_neo);
end //
delimiter ;

-- [2] add_airport()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new airport.  A new airport must have a unique
identifier along with a new and database-wide unique location if it will be used
to support airplane takeoffs and landings.  An airport may have a longer, more
descriptive name.  An airport must also have a city, state, and country designation. */
-- -----------------------------------------------------------------------------
drop procedure if exists add_airport;
delimiter //
create procedure add_airport (in ip_airportID char(3), in ip_airport_name varchar(200),
    in ip_city varchar(100), in ip_state varchar(100), in ip_country char(3), in ip_locationID varchar(50))
sp_main: begin
	declare airport_exists int;
	declare location_exists int;
    
	-- null checks
	if ip_airportID is NULL or ip_airport_name is NULL or ip_city is NULL or ip_city is NULL or ip_state is NULL or ip_country is NULL or ip_locationID is NULL
    then
		leave sp_main;
	end if;
    
    -- make sure airport does not exist
    select count(*) into airport_exists from airport where airportID = ip_airportID;
    if airport_exists > 0 
	then 
		leave sp_main; 
	end if;
    
    -- make sure location is unique/does not exist
    select count(*) into location_exists from location where locationID = ip_locationID;
    if location_exists > 0 
    then 
		leave sp_main; 
	end if;
    
    -- add location
    insert into location (locationID) value (ip_locationID);
    
    -- add airport
	insert into airport (airportID, airport_name, city, state, country, locationID)
	values (ip_airportID, ip_airport_name, ip_city, ip_state, ip_country, ip_locationID);
end //
delimiter ;

-- [3] add_person()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new person.  A new person must reference a unique
identifier along with a database-wide unique location used to determine where the
person is currently located: either at an airport, or on an airplane, at any given
time.  A person must have a first name, and might also have a last name.

A person can hold a pilot role or a passenger role (exclusively).  As a pilot,
a person must have a tax identifier to receive pay, and an experience level.  As a
passenger, a person will have some amount of frequent flyer miles, along with a
certain amount of funds needed to purchase tickets for flights. */
-- -----------------------------------------------------------------------------
drop procedure if exists add_person;
delimiter //
create procedure add_person (in ip_personID varchar(50), in ip_first_name varchar(100),
    in ip_last_name varchar(100), in ip_locationID varchar(50), in ip_taxID varchar(50),
    in ip_experience integer, in ip_miles integer, in ip_funds integer)
sp_main: begin
	-- null check
    if ip_personID is NULL or ip_first_name is NULL or ip_locationID is NULL
		-- Ensure that the person is a pilot or passenger
		-- not valid passenger and valid pilot
		or (not ((ip_taxID is NULL and ip_experience is NULL) and (ip_miles is not NULL and ip_funds is not NULL))
			and not ((ip_taxID is not NULL and ip_experience is not NULL) and (ip_miles is NULL and ip_funds is NULL)))
	then
		leave sp_main;
	end if;
    
	-- Ensure that the location is valid
	IF NOT EXISTS (SELECT * FROM location where locationID = ip_locationID) 
	then 
        leave sp_main;
    end if;
    
    -- Ensure that the persion ID is unique
    If Exists( Select * from person where personID= ip_personID) 
	then 
		leave sp_main;
    end if;
    
    -- Add them to the person table as well as the table of their respective role
    insert into Person(personID,first_name,last_name,locationID) values (ip_personID,ip_first_name,
    ip_last_name,ip_locationID);
    
    -- if valid pilot
    If ((ip_taxID is not NULL and ip_experience is not NULL) and (ip_miles is NULL and ip_funds is NULL)) and ip_experience >= 0 
    then
		insert into pilot(personID,taxID,experience) values (ip_personID,ip_taxID,ip_experience);
	-- if valid passenger
	elseif (ip_taxID is NULL and ip_experience is NULL) and (ip_miles is not NULL and ip_funds is not NULL) 
    then
		insert into Passenger(personID,miles,funds) values (ip_personID,ip_miles,ip_funds);
	end if;
end //
delimiter ;


-- [4] grant_or_revoke_pilot_license()
-- -----------------------------------------------------------------------------
/* This stored procedure inverts the status of a pilot license.  If the license
doesn't exist, it must be created; and, if it aready exists, then it must be removed. */
-- -----------------------------------------------------------------------------
drop procedure if exists grant_or_revoke_pilot_license;
delimiter //
create procedure grant_or_revoke_pilot_license (in ip_personID varchar(50), in ip_license varchar(100))
sp_main: begin
	-- null checks
    if ip_personID is NULL or ip_license is NULL
    then
		leave sp_main;
	end if;
    
	-- Ensure that the person is a valid pilot
    if not exists (select * from pilot where personID= ip_personID) 
		then leave sp_main;
    end if;
    
    -- If license exists, delete it, otherwise add the license
    if exists (select * from pilot_licenses where license= ip_license) 
    then 
		delete from pilot_licenses where personID= ip_personID and license = ip_license;
    else 
		insert into pilot_licenses (personID, license) values (ip_personID,ip_license);
    end if;
end //
delimiter ;

-- [5] offer_flight()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new flight.  The flight can be defined before
an airplane has been assigned for support, but it must have a valid route.  And
the airplane, if designated, must not be in use by another flight.  The flight
can be started at any valid location along the route except for the final stop,
and it will begin on the ground.  You must also include when the flight will
takeoff along with its cost. */
-- -----------------------------------------------------------------------------
drop procedure if exists offer_flight;
delimiter //
create procedure offer_flight (in ip_flightID varchar(50), in ip_routeID varchar(50),
    in ip_support_airline varchar(50), in ip_support_tail varchar(50), in ip_progress integer,
    in ip_next_time time, in ip_cost integer)
sp_main: begin
	-- Null check
    if ip_flightID is NULL or ip_routeID is NULL or ip_support_airline is NULL or ip_support_tail is NULL or ip_progress is NULL or ip_next_time is NULL or ip_cost is NULL
	-- Ensure that the airplane exists
		or not exists (select * from airplane where airlineID = ip_support_airline and tail_num = ip_support_tail)
	-- Ensure that the route exists
		or not exists (select * from route where routeID = ip_routeID)
	-- Ensure that the progress is less than the length of the route
		or ip_progress >= (select max(sequence) from route_path where routeID = ip_routeID)
	-- Flight has valid route
		or not exists (select * from route where routeID = ip_routeId)
    -- Airplane not used by other flight
		or exists (select * from flight where support_tail = ip_support_tail and support_airline = ip_support_airline)
    -- Location except last stop
		or ip_progress >= (select max(sequence) from route_path where routeID = ip_routeID)
    -- Progress and cost is not wack
		or ip_progress < 0
        or ip_cost < 0
    then
		leave sp_main;
	end if;
    -- Create the flight with the airplane starting in on the ground
    insert into flight
    values (ip_flightID, ip_routeID, ip_support_airline, ip_support_tail, ip_progress, 'on_ground', ip_next_time, ip_cost);
end //
delimiter ;

-- [6] flight_landing()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for a flight landing at the next airport
along it's route.  The time for the flight should be moved one hour into the future
to allow for the flight to be checked, refueled, restocked, etc. for the next leg
of travel.  Also, the pilots of the flight should receive increased experience, and
the passengers should have their frequent flyer miles updated. */
-- -----------------------------------------------------------------------------
drop procedure if exists flight_landing;
delimiter //
create procedure flight_landing (in ip_flightID varchar(50))
sp_main: begin
	declare flight_exists int;
    declare is_in_air int;
    declare route_ID varchar(50);
    declare f_progress int;
    declare leg_ID varchar(50);
    declare leg_distance int;
    
    -- null check
    if ip_flightID is NULL
	then
		leave sp_main;
	end if;
    
	-- Ensure that the flight exists
	select count(*) into flight_exists from flight where flightID = ip_flightID;
    if flight_exists = 0 
	then 
		leave sp_main; 
	end if;
    
    -- Ensure that the flight is in the air
    select count(*) into is_in_air from flight where flightID = ip_flightID and airplane_status = 'in_flight';
    if is_in_air = 0 
		then leave sp_main; 
	end if;
    
    select routeID, progress into route_id, f_progress from flight where flightID = ip_flightID;
    select legID into leg_ID from route_path where routeID = route_id and sequence = f_progress;
    select distance into leg_distance from leg where legID = leg_ID;
    -- Increment the pilot's experience by 1
    update pilot set experience = experience + 1 where commanding_flight = ip_flightID;
    
    -- Increment the frequent flyer miles of all passengers on the plane
    update passenger 
    set miles = miles + leg_distance 
    where personID in 
			(select personID from person p join airplane a on p.locationID = a.locationID
            join flight f on f.support_airline = a.airlineID and f.support_tail = a.tail_num
            where f.flightID = ip_flightID);
    -- Update the status of the flight and increment the next time to 1 hour later
    update flight 
    set airplane_status = 'on_ground', next_time = ADDTIME(next_time, '1:00:00') 
	where flightID = ip_flightID;
	-- Hint: use addtime()
end //
delimiter ;

-- [7] flight_takeoff()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for a flight taking off from its current
airport towards the next airport along it's route.  The time for the next leg of
the flight must be calculated based on the distance and the speed of the airplane.
And we must also ensure that Airbus and general planes have at least one pilot
assigned, while Boeing must have a minimum of two pilots. If the flight cannot take
off because of a pilot shortage, then the flight must be delayed for 30 minutes. */
-- -----------------------------------------------------------------------------
drop procedure if exists flight_takeoff;
delimiter //
CREATE PROCEDURE flight_takeoff(IN ip_flightID VARCHAR(50))
sp_main: BEGIN
    DECLARE flight_routeID VARCHAR(50);
    DECLARE flight_progress INT;
    DECLARE max_progress INT;
    DECLARE plane_type VARCHAR(100);
    DECLARE num_assigned_pilots INT;
    DECLARE flight_time TIME;
    DECLARE airplane_speed INT;
    DECLARE leg_distance INT;
    DECLARE new_next_time TIME;
    
    -- Exit conditions
    IF ip_flightID IS NULL OR 
       NOT EXISTS (SELECT 1 FROM flight WHERE flightID = ip_flightID) OR
       (SELECT airplane_status FROM flight WHERE flightID = ip_flightID) != 'on_ground'
    THEN
        LEAVE sp_main;
    END IF;
    
    -- Check if flight has another leg to fly
    SELECT routeID, progress INTO flight_routeID, flight_progress 
    FROM flight 
    WHERE flightID = ip_flightID;
    
    SELECT MAX(sequence) INTO max_progress 
    FROM route_path 
    WHERE routeID = flight_routeID;
    
    IF flight_progress >= max_progress THEN
        LEAVE sp_main;
    END IF;
    
    -- Check for enough pilots
    SELECT airplane.plane_type INTO plane_type
    FROM airplane 
    JOIN flight ON (flight.support_airline, flight.support_tail) = (airplane.airlineID, airplane.tail_num)
    WHERE flightID = ip_flightID;
        
    SELECT COUNT(*) INTO num_assigned_pilots 
    FROM pilot 
    WHERE commanding_flight = ip_flightID;
    
    -- Delay flight if not enough pilots
    IF (plane_type = 'Boeing' AND num_assigned_pilots < 2) OR
       (plane_type IN ('Airbus', 'General') AND num_assigned_pilots < 1) 
    THEN
        UPDATE flight 
        SET next_time = ADDTIME(next_time, '00:30:00') 
        WHERE flightID = ip_flightID;
        LEAVE sp_main;
    END IF;
    
    -- Update flight status and progress
    UPDATE flight 
    SET progress = progress + 1, 
        airplane_status = 'in_flight' 
    WHERE flightID = ip_flightID;
    
    -- Calculate flight time and update next_time
    SELECT speed INTO airplane_speed
    FROM airplane 
    JOIN flight ON (flight.support_airline, flight.support_tail) = (airplane.airlineID, airplane.tail_num)
    WHERE flightID = ip_flightID;
    
    SELECT distance INTO leg_distance
    FROM leg 
    WHERE legID = (
        SELECT legID 
        FROM route_path 
        WHERE sequence = (SELECT progress FROM flight WHERE flightID = ip_flightID) 
        AND routeID = flight_routeID
    );
    
    SET flight_time = SEC_TO_TIME(leg_distance / airplane_speed * TIME_TO_SEC('01:00:00'));
    
    SET new_next_time = ADDTIME((SELECT next_time FROM flight WHERE flightID = ip_flightID), flight_time);
    SET new_next_time = SEC_TO_TIME(MOD(TIME_TO_SEC(new_next_time), TIME_TO_SEC('24:00:00')));
    
    UPDATE flight 
    SET next_time = new_next_time 
    WHERE flightID = ip_flightID;
END;
delimiter ;

-- [8] passengers_board()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for passengers getting on a flight at
its current airport.  The passengers must be at the same airport as the flight,
and the flight must be heading towards that passenger's desired destination.
Also, each passenger must have enough funds to cover the flight.  Finally, there
must be enough seats to accommodate all boarding passengers. */
-- -----------------------------------------------------------------------------
drop procedure if exists passengers_board;
delimiter //
create procedure passengers_board (in ip_flightID varchar(50))
sp_main: begin
	-- Ensure the flight exists
    -- Ensure that the flight is on the ground
    -- Ensure that the flight has further legs to be flown
    
    -- Determine the number of passengers attempting to board the flight
    -- Use the following to check:
		-- The airport the airplane is currently located at
        -- The passengers are located at that airport
        -- The passenger's immediate next destination matches that of the flight
        -- The passenger has enough funds to afford the flight
        
	-- Check if there enough seats for all the passengers
		-- If not, do not add board any passengers
        -- If there are, board them and deduct their funds
	-- null check
    if ip_flightID is NULL
    then
		leave sp_main;
	end if;
    
	-- Checks if the flight exists
    if ip_flightID not in (select flightID from flight) 
	then
		leave sp_main;
	end if;
	
    -- Checks if the flight is on the ground
	if (select airplane_status from flight where flightID = ip_flightID) != 'on_ground' 
	then
        leave sp_main;
	end if;
	
    -- Checks if the flight has further legs to be flown
    begin
		declare flight_routeID varchar(50);
		declare flight_progress int;
		declare max_progress int;
		select routeID, progress from flight where flightID = ip_flightID into flight_routeID, flight_progress; -- Get flight's routeID and progress
		select max(sequence) from route_path where routeID = flight_routeID into max_progress; -- Get the max sequence (End of flight) with a route
		
		if flight_progress >= max_progress then
			leave sp_main;
		end if;
	end;
    
    -- Determine the number of passengers trying to board
    begin
		declare airplane_location varchar(50);
        declare airplane_destination char(3);
        declare flight_cost int;
        declare num_boarders int;
        declare airplane_seat_capacity int;
        
        -- initialize airplane_location and airplane_destination
        select departure, arrival from leg where legID
			in (select legID from route_path where routeID = (select routeID from flight where flightID = ip_flightID)
			and sequence = (select progress from flight where flightID = ip_flightID) + 1) into airplane_location, airplane_destination;
            
		-- initialize flight_cost
		select cost from flight where flightID = ip_flightID into flight_cost;
		
        -- initialze num_boarders (passengers trying to board flight)
        select count(*) from (select person.personID, first_name, last_name, person.locationID, airport.airportID as curr_airport, miles, funds, passenger_vacations.airportID as dest_airport, sequence
			from person join airport on person.locationID = airport.locationID
			join passenger on person.personID = passenger.personID
			join passenger_vacations on person.personID = passenger_vacations.personID) as passenger_data
				where curr_airport = airplane_location
				and dest_airport = airplane_destination
				and funds >= (select cost from flight where flightID = ip_flightID) into num_boarders;
        
        -- initialize seat_capacity
        select seat_capacity from airplane join flight on (flight.support_airline, flight.support_tail) = (airplane.airlineID, airplane.tail_num)
			where (flight.support_airline, flight.support_tail) = (select support_airline, support_tail from flight where flightID = ip_flightID) into airplane_seat_capacity;
        
        -- if more passengers than seats
        if num_boarders > airplane_seat_capacity then
            leave sp_main;
		end if;
                
        -- Deduct the cost of the flight
        update passenger 
        set funds = funds - (select cost from flight where flightID = ip_flightID) 
        where passenger.personID =
			(select personID 
			from (
				select person.personID, first_name, last_name, person.locationID, airport.airportID as curr_airport, miles, funds, passenger_vacations.airportID as dest_airport, sequence
				from person join airport on person.locationID = airport.locationID
				join passenger on person.personID = passenger.personID
				join passenger_vacations on person.personID = passenger_vacations.personID
			) as passenger_data
			where curr_airport = airplane_location
				and dest_airport = airplane_destination
				and funds >= (select cost from flight where flightID = ip_flightID)
			);
            
		-- Increase airline's revenue
        update airline 
        set revenue = revenue + (select cost from flight where flightID = ip_flightID) * num_boarders
		where airlineID = (select airlineID from flight where flightID = ip_flightID);
		
        -- Set boarders locations to airplane.
        update person 
        set locationID = (
				select locationID 
				from airplane 
				where (airlineID, tail_num) = (select support_airline, support_tail from flight where flightID = ip_flightID)
            ) where person.personID
			= (
				select personID
                from (
					select person.personID, first_name, last_name, person.locationID, airport.airportID as curr_airport, miles, funds, passenger_vacations.airportID as dest_airport, sequence
					from person join airport on person.locationID = airport.locationID
					join passenger on person.personID = passenger.personID
					join passenger_vacations on person.personID = passenger_vacations.personID
				) as passenger_data
				where curr_airport = airplane_location
				and dest_airport = airplane_destination
				and funds >= (select cost from flight where flightID = ip_flightID));
	end;

end //
delimiter ;

-- [9] passengers_disembark()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for passengers getting off of a flight
at its current airport.  The passengers must be on that flight, and the flight must
be located at the destination airport as referenced by the ticket. */
-- -----------------------------------------------------------------------------
drop procedure if exists passengers_disembark;
delimiter //
create procedure passengers_disembark (in ip_flightID varchar(50))
sp_main: begin
	declare flight_support_airplane_locationID varchar(50);
    declare dest_airport_airportID varchar(50);
    
	-- Null check
	if ip_flightID is NULL
	-- Ensure the flight exists
		or not exists (select * from flight where flightID = ip_flightID)
    -- Ensure that the flight is on the ground
		or not (select airplane_status from flight where flightID = ip_flightID) = 'on_ground'
    then
		leave sp_main;
	end if;
    
    -- airplane locationID that supports this flight
	select locationID into flight_support_airplane_locationID from airplane a 
    join flight f on f.support_airline = a.airlineID and f.support_tail = a.tail_num
    where f.flightId = ip_flightID;
    
    -- airport airportID that flight is at
    select airportID into dest_airport_airportID from airport a
    join leg l on l.arrival = a.airportID
    join route_path rp on rp.legID = l.legID
    join flight f on f.routeID = rp.routeID
    where f.flightID = ip_flightID and f.progress = rp.sequence;
    
    -- find all people who are on the correct plane and next destination airport is the one the flight is at
	drop table if exists criteria_people;
    create table criteria_people like person;
    
	insert into criteria_people
    select pe.personID, pe.first_name, pe.last_name, pe.locationID from person pe
	join passenger_vacations pv on pv.personID = pe.personID
    where pe.locationID = flight_support_airplane_locationID and pv.sequence = 1 and pv.airportID = dest_airport_airportID;

	-- Move the appropriate passengers to the airport
    update person
    set locationID = (select locationID from airport where airportId = dest_airport_airportID)
    where personID in (select personID from criteria_people);
    
    -- Update the vacation plans of the passengers
	delete from passenger_vacations
    where personID in (select personID from criteria_people) and sequence = 1;
    
    -- Update passenger_vacations
    update passenger_vacations
    set sequence = sequence - 1
    where personID in (select personId from criteria_people);
    
    -- drop temp table
    drop table if exists criteria_people;
end //
delimiter ;

-- [10] assign_pilot()
-- -----------------------------------------------------------------------------
/* This stored procedure assigns a pilot as part of the flight crew for a given
flight.  The pilot being assigned must have a license for that type of airplane,
and must be at the same location as the flight.  Also, a pilot can only support
one flight (i.e. one airplane) at a time.  The pilot must be assigned to the flight
and have their location updated for the appropriate airplane. */
-- -----------------------------------------------------------------------------
drop procedure if exists assign_pilot;
delimiter //
create procedure assign_pilot (in ip_flightID varchar(50), ip_personID varchar(50))
sp_main: begin
	declare flight_exists int;
    declare pilot_exists int;
    declare on_ground int;
    declare remaining_legs int;
    declare plane_type varchar(100);
    declare plane_loc varchar(50);
    declare flight_loc varchar(50);
    declare pilot_loc varchar(50);
    declare route_id varchar(50);
    declare f_progress int;
    declare airplane_type varchar(100);
    declare match_count int;
    
    -- null check
    if ip_flightID is NULL or ip_personID is NULL
    then
		leave sp_main;
	end if;
    
    -- Ensure the flight exists
    select count(*) into flight_exists from flight where flightID = ip_flightID;
    if flight_exists = 0 
    then 
		leave sp_main; 
	end if;
	
    -- Ensure that the flight is on the ground
	select count(*) into on_ground from flight where flightID = ip_flightID and airplane_status = 'on_ground';
    if on_ground = 0 
    then 
		leave sp_main; 
	end if;
    
    -- Ensure that the flight has further legs to be flown
	select routeID, progress into route_id, f_progress from flight where flightID = ip_flightID;
	select count(*) into remaining_legs from route_path where routeID = route_id and sequence > f_progress;
	if remaining_legs = 0 
    then 
		leave sp_main;
	end if;
    
    -- Ensure that the pilot exists and is not already assigned
    select count(*) into pilot_exists from pilot where personID = ip_personID and commanding_flight is null;
    if pilot_exists = 0 
    then 
		leave sp_main; 
	end if;
    
    -- initialize airplane_type
    select a.plane_type into airplane_type from flight f 
    join airplane a on f.support_airline = a.airlineID and f.support_tail = a.tail_num 
	where f.flightID = ip_flightID;
	
    -- get num. license that match airplane
	select COUNT(*) into match_count from pilot_licenses 
	where personID = ip_personID and (license = airplane_type or (airplane_type is NULL and license = 'general'));
    
    -- Ensure that the pilot has the appropriate license
	if match_count = 0 then leave sp_main; end if;
    
    -- initialize plane_loc
    select a.locationID into plane_loc from flight f 
	join airplane a on f.support_airline = a.airlineID and f.support_tail = a.tail_num 
	where f.flightID = ip_flightID;
		
	-- initialize pilot_loc
	select p.locationID into pilot_loc from person p where p.personID = ip_personID;
    
    -- initialize flight_loc
    select ar.locationID into flight_loc from flight f 
	left join route_path r on f.routeID = r.routeID and f.progress = r.sequence 
	join leg l on r.legID = l.legID 
	join airport ar on l.departure = ar.airportID 
	where f.flightID = ip_flightID;
    
    -- Ensure the pilot is located at the airport of the plane that is supporting the flight
    if pilot_loc is null or pilot_loc != flight_loc 
    then 
		leave sp_main; 
	end if;
    
    if plane_loc is null
    then
		leave sp_main;
	end if;
    
     -- Assign the pilot to the flight and update their location to be on the plane
    update pilot set commanding_flight =  ip_flightID where personID = ip_personID;
    
    -- update person location
	update person set locationID = plane_loc where personID = ip_personID;
end //
delimiter ;

-- [11] recycle_crew()
-- -----------------------------------------------------------------------------
/* This stored procedure releases the assignments for a given flight crew.  The
flight must have ended, and all passengers must have disembarked. */
-- -----------------------------------------------------------------------------
drop procedure if exists recycle_crew;
delimiter //
create procedure recycle_crew (in ip_flightID varchar(50))
sp_main: begin
	declare loc_airport VARCHAR(50);
    
    -- null check
    if ip_flightID is NULL
    then
		leave sp_main;
	end if;
    
    -- initialize loc_airport
    select a.locationID into loc_airport
	from flight  f join route_path r on f.progress= r.sequence 
    and f.routeID=r.routeID join leg l on r.legID= l.legID join airport a on 
    l.arrival = a.airportID where f.flightID= ip_flightID;
    
    -- Ensure that the flight is on the ground
	if not exists (select * from flight where flightID=ip_flightID and airplane_status= 'on_ground') 
    then 
		leave sp_main;
    end if;
    
	-- Ensure that the flight does not have any more legs
	begin
		declare flight_routeID varchar(50);
		declare flight_progress int;
		declare max_progress int;
		select routeID, progress from flight where flightID = ip_flightID into flight_routeID, flight_progress; -- Get flight's routeID and progress
		select max(sequence) from route_path where routeID = flight_routeID into max_progress; -- Get the max sequence (End of flight) with a route
		
		if flight_progress < max_progress then
			leave sp_main;
		end if;
	end;
    
    -- Ensure that the flight is empty of passengers
	if exists (select * from person p join passenger pa on p.personID=pa.personID where p.locationID=loc_airport) 
    then 
		leave sp_main;
    end if;
    
    -- Update assignements of all pilots
    update person 
    set locationID = loc_airport 
    where personID IN (select personID from pilot where commanding_flight=ip_flightID);
    
    -- Move all pilots to the airport the plane of the flight is located at
    update pilot set commanding_flight = null where commanding_flight = ip_flightID;

end //
delimiter ;

-- [12] retire_flight()
-- -----------------------------------------------------------------------------
/* This stored procedure removes a flight that has ended from the system.  The
flight must be on the ground, and either be at the start its route, or at the
end of its route.  And the flight must be empty - no pilots or passengers. */
-- -----------------------------------------------------------------------------
drop procedure if exists retire_flight;
delimiter //
create procedure retire_flight (in ip_flightID varchar(50))
sp_main: begin    
    -- null check
    if ip_flightID is NULL
    then
		leave sp_main;
	end if;
    
    -- Ensure that the flight is on the ground
	if (select airplane_status from flight where flightID = ip_flightID) != 'on_ground' then
        leave sp_main;
	end if;
        
	-- Ensure that the flight does not have any more legs
    begin
		declare flight_routeID varchar(50);
		declare flight_progress int;
		declare max_progress int;
		select routeID, progress from flight where flightID = ip_flightID into flight_routeID, flight_progress; -- Get flight's routeID and progress
		select max(sequence) from route_path where routeID = flight_routeID into max_progress; -- Get the max sequence (End of flight) with a route
		
		if flight_progress < max_progress then
	
			leave sp_main;
		end if;
	end;
    
     -- Ensure that there are no more people on the plane supporting the flight
    if (select count(*) 
        from airplane 
        join person on airplane.locationID = person.locationID
		where (airlineID, tail_num) = (
			select support_airline, support_tail 
			from flight 
            where flightID = ip_flightID)
		) > 0 
	then
		leave sp_main;
	end if;
    
    -- Remove the flight from the system
    delete from flight where flightID = ip_flightID;
end //
delimiter ;

-- [13] simulation_cycle()
-- -----------------------------------------------------------------------------
/* This stored procedure executes the next step in the simulation cycle.  The flight
with the smallest next time in chronological order must be identified and selected.
If multiple flights have the same time, then flights that are landing should be
preferred over flights that are taking off.  Similarly, flights with the lowest
identifier in alphabetical order should also be preferred.

If an airplane is in flight and waiting to land, then the flight should be allowed
to land, passengers allowed to disembark, and the time advanced by one hour until
the next takeoff to allow for preparations.

If an airplane is on the ground and waiting to takeoff, then the passengers should
be allowed to board, and the time should be advanced to represent when the airplane
will land at its next location based on the leg distance and airplane speed.

If an airplane is on the ground and has reached the end of its route, then the
flight crew should be recycled to allow rest, and the flight itself should be
retired from the system. */
-- -----------------------------------------------------------------------------
drop procedure if exists simulation_cycle;
delimiter //
create procedure simulation_cycle ()
sp_main: begin
	declare nextFlightID varchar(50);
    declare nextFlightStatus varchar(50);
    declare nextFlightRouteID varchar(50);
    declare nextFlightProgress int;
    
	-- Identify the next flight to be processed and all its details
	select flightID, airplane_status, routeID, progress into nextFlightID, nextFlightStatus, nextFlightRouteID, nextFlightProgress
	from flight 
	order by next_time asc, airplane_status desc, flightID asc
	limit 1;
    
    -- If the flight is in the air:
    if nextFlightStatus = 'in_flight'
    then
		-- Land the flight and disembark passengers
        call flight_landing(nextFlightID);
        call passengers_disembark(nextFlightID);
	-- If the flight is on the ground:
    elseif nextFlightStatus = 'on_ground'
    then
		-- If it has reached the end:
        if not exists (select sequence from route_path where routeID = nextFlightRouteID) 
        then
			-- Recycle crew and retire flight
			call recycle_crew(nextFlightID);
            call retire_flight(nextFlightID);
		else
		-- Board passengers and have the plane takeoff
			call passengers_board(nextFlightID);
            call flight_takeoff(nextFlightID);
        end if;
	end if;
	-- Hint: use the previously created procedures
end //
delimiter ;

-- [14] flights_in_the_air()
-- -----------------------------------------------------------------------------
/* This view describes where flights that are currently airborne are located. 
We need to display what airports these flights are departing from, what airports 
they are arriving at, the number of flights that are flying between the 
departure and arrival airport, the list of those flights (ordered by their 
flight IDs), the earliest and latest arrival times for the destinations and the 
list of planes (by their respective flight IDs) flying these flights. */
CREATE OR REPLACE VIEW flights_in_the_air (departing_from , arriving_at , num_flights , flight_list , earliest_arrival , latest_arrival , airplane_list) AS
    SELECT 
        l.departure AS departing_from,
        l.arrival AS arriving_at,
        COUNT(*) AS num_flights,
        GROUP_CONCAT(f.flightID
            ORDER BY f.flightID
            SEPARATOR ',') AS flight_list,
        MIN(f.next_time) AS earliest_arrival,
        MAX(f.next_time) AS latest_arrival,
        GROUP_CONCAT(a.locationID
            ORDER BY f.flightID
            SEPARATOR ',') AS airplane_list
    FROM
        leg l
            JOIN
        route_path rp ON l.legID = rp.legID
            JOIN
        flight f ON rp.routeID = f.routeID
            JOIN
        airplane a ON f.support_airline = a.airlineID
            AND f.support_tail = a.tail_num
    WHERE
        f.airplane_status = 'in_flight'
            AND f.progress = rp.sequence
    GROUP BY l.departure , l.arrival;

-- [15] flights_on_the_ground()
-- ------------------------------------------------------------------------------
/* This view describes where flights that are currently on the ground are 
located. We need to display what airports these flights are departing from, how 
many flights are departing from each airport, the list of flights departing from 
each airport (ordered by their flight IDs), the earliest and latest arrival time 
amongst all of these flights at each airport, and the list of planes (by their 
respective flight IDs) that are departing from each airport.*/
CREATE OR REPLACE VIEW flights_on_the_ground (departing_from , num_flights , flight_list , earliest_arrival , latest_arrival , airplane_list) AS
    SELECT 
        IFNULL(l1.departure, l2.arrival) AS departing_from,
        COUNT(*) AS num_flights,
        GROUP_CONCAT(f.flightID
            ORDER BY f.flightID
            SEPARATOR ',') AS flight_list,
        MIN(f.next_time) AS earliest_arrival,
        MAX(f.next_time) AS latest_arrival,
        GROUP_CONCAT(a.locationID
            ORDER BY f.flightID
            SEPARATOR ',') AS airplane_list
    FROM
        flight f
            JOIN
        airplane a ON f.support_airline = a.airlineID
            AND f.support_tail = a.tail_num
            LEFT JOIN
        route_path r1 ON f.routeID = r1.routeID
            AND f.progress + 1 = r1.sequence
            LEFT JOIN
        leg l1 ON l1.legID = r1.legID
            LEFT JOIN
        route_path r2 ON f.routeID = r2.routeID
            AND f.progress = r2.sequence
            LEFT JOIN
        leg l2 ON r2.legID = l2.legID
    WHERE
        f.airplane_status = 'on_ground'
    GROUP BY departing_from;


-- [16] people_in_the_air()
-- -----------------------------------------------------------------------------
/* This view describes where people who are currently airborne are located. We 
need to display what airports these people are departing from, what airports 
they are arriving at, the list of planes (by the location id) flying these 
people, the list of flights these people are on (by flight ID), the earliest 
and latest arrival times of these people, the number of these people that are 
pilots, the number of these people that are passengers, the total number of 
people on the airplane, and the list of these people by their person id. */
CREATE OR REPLACE VIEW people_in_the_air (departing_from , arriving_at , num_airplanes , airplane_list , flight_list , earliest_arrival , latest_arrival , num_pilots , num_passengers , joint_pilots_passengers , person_list) AS
    SELECT 
        l.departure AS departing_from,
        l.arrival AS arriving_at,
        COUNT(DISTINCT a.tail_num, a.airlineID) AS num_airplanes,
        GROUP_CONCAT(DISTINCT a.locationID
            ORDER BY a.locationID
            SEPARATOR ',') AS airplane_list,
        GROUP_CONCAT(DISTINCT f.flightID
            ORDER BY f.flightID
            SEPARATOR ',') AS flight_list,
        MIN(f.next_time) AS earliest_arrival,
        MAX(f.next_time) AS latest_arrival,
        COUNT(pt.taxID) AS num_pilots,
        COUNT(pa.miles) AS num_passengers,
        COUNT(p.personID) AS joint_pilot_passengers,
        GROUP_CONCAT(DISTINCT p.personID
            ORDER BY p.personID
            SEPARATOR ',')
    FROM
        leg l
            JOIN
        route_path rp ON l.legID = rp.legID
            JOIN
        flight f ON rp.routeID = f.routeID
            JOIN
        airplane a ON f.support_airline = a.airlineID
            AND f.support_tail = a.tail_num
            JOIN
        person p ON a.locationID = p.locationID
            LEFT JOIN
        pilot pt ON p.personID = pt.personID
            LEFT JOIN
        passenger pa ON p.personID = pa.personID
    WHERE
        f.airplane_status = 'in_flight'
            AND f.progress = rp.sequence
    GROUP BY l.departure , l.arrival;


-- [17] people_on_the_ground()
-- -----------------------------------------------------------------------------
/* This view describes where people who are currently on the ground and in an 
airport are located. We need to display what airports these people are departing 
from by airport id, location id, and airport name, the city and state of these 
airports, the number of these people that are pilots, the number of these people 
that are passengers, the total number people at the airport, and the list of 
these people by their person id. */
CREATE OR REPLACE VIEW people_on_the_ground (departing_from , airport , airport_name , city , state , country , num_pilots , num_passengers , joint_pilots_passengers , person_list) AS
    SELECT 
        airportID AS departing_from,
        airport.locationID AS airport,
        airport_name,
        city,
        state,
        country,
        COUNT(pilot.personID) AS num_pilots,
        (SELECT 
                COUNT(personID)
            FROM
                person
            WHERE
                personID IN (SELECT 
                        personID
                    FROM
                        passenger)
                    AND person.locationID = airport.locationID) AS num_passengers,
        COUNT(person.personID) AS join_pilots_passengers,
        GROUP_CONCAT(person.personID) AS person_list
    FROM
        person
            JOIN
        airport ON person.locationID = airport.locationID
            LEFT JOIN
        pilot ON person.personID = pilot.personID
    GROUP BY airportID;


-- [18] route_summary()
-- -----------------------------------------------------------------------------
/* This view will give a summary of every route. This will include the routeID, 
the number of legs per route, the legs of the route in sequence, the total 
distance of the route, the number of flights on this route, the flightIDs of 
those flights by flight ID, and the sequence of airports visited by the route. */
CREATE OR REPLACE VIEW route_summary (route , num_legs , leg_sequence , route_length , num_flights , flight_list , airport_sequence) AS
    SELECT 
        rp.routeID AS route,
        COUNT(DISTINCT rp.legID) AS num_legs,
        GROUP_CONCAT(DISTINCT l.legID
            ORDER BY rp.sequence
            SEPARATOR ',') AS leg_sequence,
        (SELECT 
                SUM(l2.distance)
            FROM
                route_path rp2
                    LEFT JOIN
                leg l2 ON rp2.legID = l2.legID
            WHERE
                rp2.routeID = rp.routeID
            GROUP BY rp2.routeID) AS route_length,
        COUNT(DISTINCT f.flightID) AS num_flights,
        GROUP_CONCAT(DISTINCT f.flightID
            ORDER BY f.flightID
            SEPARATOR ',') AS flight_list,
        GROUP_CONCAT(DISTINCT CONCAT_WS('->', l.departure, l.arrival)
            ORDER BY rp.sequence
            SEPARATOR ',') AS airport_sequence
    FROM
        route_path rp
            LEFT JOIN
        leg l ON rp.legID = l.legID
            LEFT JOIN
        flight f ON rp.routeID = f.routeID
    GROUP BY rp.routeID;

-- [19] alternative_airports()
-- -----------------------------------------------------------------------------
/* This view displays airports that share the same city and state. It should 
specify the city, state, the number of airports shared, and the lists of the 
airport codes and airport names that are shared both by airport ID. */
CREATE OR REPLACE VIEW alternative_airports (city , state , country , num_airports , airport_code_list , airport_name_list) AS
    SELECT 
        city,
        state,
        country,
        COUNT(*) AS num_airports,
        GROUP_CONCAT(airportID
            ORDER BY airportID
            SEPARATOR ',') AS airport_code_list,
        GROUP_CONCAT(airport_name
            ORDER BY airportID
            SEPARATOR ',') AS airport_name_list
    FROM
        airport
    GROUP BY city , state , country
    HAVING COUNT(*) > 1;
