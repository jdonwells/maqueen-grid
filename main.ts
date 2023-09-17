function show_line_sensors () {
    basic.clearScreen()
    if (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == 1) {
        led.plot(1, 2)
    }
    if (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == 1) {
        led.plot(2, 2)
    }
    if (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == 1) {
        led.plot(3, 2)
    }
}
function choose_a_direction () {
    proposed_direction = direction_after_turn(STRAIGHT)
    if (can_go_in_direction(proposed_direction) && lower_cost_in_direction(proposed_direction)) {
        return
    }
    proposed_direction = direction_after_turn(LEFT)
    if (can_go_in_direction(proposed_direction) && lower_cost_in_direction(proposed_direction)) {
        make_a_90_degree_turn(LEFT)
        return
    }
    proposed_direction = direction_after_turn(RIGHT)
    if (can_go_in_direction(proposed_direction) && lower_cost_in_direction(proposed_direction)) {
        make_a_90_degree_turn(RIGHT)
        return
    }
    proposed_direction = opposite_direction[direction]
    if (can_go_in_direction(proposed_direction) && lower_cost_in_direction(proposed_direction)) {
        make_a_90_degree_turn(RIGHT)
        make_a_90_degree_turn(RIGHT)
        return
    }
    radio_send_string_and_pause("LOCKED CAN'T MOVE")
    stop()
}
function update_coordinates_to_direction (direction: number) {
    x = x + delta_x[direction]
    y = y + delta_y[direction]
    radio_send_coordinates()
}
function change_Y_point () {
    y = (y + 1) % 5
    radio_send_coordinates()
}
function add_a_wall_in_direction (x_location: number, y_location: number, wall_direction: number) {
    set_wall_type_in_in_direction(x_location, y_location, wall_direction, WALL)
    set_wall_type_in_in_direction(x_location + delta_x[wall_direction], y_location + delta_y[wall_direction], opposite_direction[wall_direction], WALL)
}
function center_on_crossroad () {
    for (let index2 = 0; index2 < iterations_to_center_of_line; index2++) {
        drive_mostly_straight()
        basic.pause(1)
    }
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    update_coordinates_to_direction(direction)
    check_goal()
}
function make_a_90_degree_turn (turn_direction: number) {
    if (turn_direction == RIGHT) {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, spin_speed)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, spin_speed)
    } else if (turn_direction == LEFT) {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, spin_speed)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, spin_speed)
    } else {
        return
    }
    maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Yellow)
    while (on_line()) {
        basic.pause(1)
    }
    while (!(center_of_line())) {
        basic.pause(1)
    }
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    direction = direction_after_turn(turn_direction)
}
function center_of_line () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == ON
}
function lower_cost_in_direction (new_direction: number) {
    return flood_map[x][y] > flood_map[x + delta_x[new_direction]][y + delta_y[new_direction]]
}
function set_wall_type_in_in_direction (the_x: number, the_y: number, the_direction: number, _type: string) {
    walls = map[the_x][the_y].split("")
    walls[the_direction] = _type
    map[the_x][the_y] = "" + walls[NORTH] + walls[EAST] + walls[SOUTH] + walls[WEST]
}
function can_go_in_direction (new_direction: number) {
    return map[x][y].substr(new_direction, 1).compare(OPEN) == EQUAL
}
function add_a_passage_in_direction (x_location: number, y_location: number, pass_direction: number) {
    set_wall_type_in_in_direction(x_location, y_location, pass_direction, OPEN)
    set_wall_type_in_in_direction(x_location + delta_x[pass_direction], y_location + delta_y[pass_direction], opposite_direction[pass_direction], OPEN)
}
function initialize_start_point () {
    x = 0
    y = 0
    direction = EAST
    radio_send_coordinates()
}
function empty_flood_map () {
    for (let column of flood_map) {
        for (let index = 0; index <= column.length - 1; index++) {
            column[index] = flood_null
        }
    }
    flood_map[goal_x][goal_y] = flood_goal_value
    flood_x_queue = [goal_x]
    flood_y_queue = [goal_y]
}
function debugging () {
    initialize_constants()
    initialize_map()
    goal_x = 2
    goal_y = 4
    add_a_wall_in_direction(0, 3, EAST)
    add_a_wall_in_direction(0, 4, EAST)
    initialize_start_point()
    init_flood_fill()
    flood_fill_the_map()
    basic.showIcon(IconNames.Heart)
}
function stop () {
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    go = false
    maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Red)
}
function set_implied_walls () {
    index = 0
    for (let index2 = 0; index2 < 3; index2++) {
        set_wall_type_in_in_direction(index, 0, NORTH, WALL)
        set_wall_type_in_in_direction(index, 4, SOUTH, WALL)
        index += 1
    }
    index = 0
    for (let index2 = 0; index2 < 5; index2++) {
        set_wall_type_in_in_direction(0, index, WEST, WALL)
        set_wall_type_in_in_direction(2, index, EAST, WALL)
        index += 1
    }
}
function range_finder_wall_ahead () {
    rangefinder = maqueenPlusV2.readUltrasonic(DigitalPin.P13, DigitalPin.P14)
    // 0 distance is infinity
    return rangefinder <= 4 && rangefinder > 0
}
function map_has_wall_in_direction (map_direction: number, the_x: number, the_y: number) {
    return map[the_x][the_y].substr(map_direction, 1).compare(WALL) == EQUAL
}
function radio_send_coordinates () {
    radio.sendValue("X", x)
    radio.sendValue("Y", y)
}
function map_has_wall_after_turn (turn_direction: number, the_x: number, the_y: number) {
    proposed_direction = direction_after_turn(turn_direction)
    return map[the_x][the_y].substr(proposed_direction, 1).compare(WALL) == EQUAL
}
function init_flood_fill () {
    flood_map = [[
    0,
    0,
    0,
    0,
    0
    ], [
    0,
    0,
    0,
    0,
    0
    ], [
    0,
    0,
    0,
    0,
    0
    ]]
    flood_null = 100
    flood_goal_value = 1
}
function find_walls () {
    look_for_wall_after_turn(LEFT)
    look_for_wall_after_turn(STRAIGHT)
    look_for_wall_after_turn(RIGHT)
}
function on_line () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == ON || (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == ON || maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == ON)
}
function check_goal () {
    if (x == goal_x && y == goal_y) {
        music._playDefaultBackground(music.builtInPlayableMelody(Melodies.PowerUp), music.PlaybackMode.InBackground)
        stop()
        for (let index2 = 0; index2 < 5; index2++) {
            maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Blue)
            basic.pause(100)
            maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Red)
            basic.pause(100)
        }
    }
}
function is_wall_in_direction_unknown (wall_direction: number) {
    return map[x][y].substr(wall_direction, 1).compare(UNKNOWN) == EQUAL
}
function radio_change_the_map (change_x: number, change_y: number, change_direction: number, change_type: string) {
    radio.sendString("" + change_type + " " + change_x + " " + change_y + " " + change_direction)
    basic.pause(3000)
}
function look_for_wall_after_turn (wall_turn_direction: number) {
    proposed_direction = direction_after_turn(wall_turn_direction)
    if (is_wall_in_direction_unknown(proposed_direction)) {
        if (wall_turn_direction != STRAIGHT) {
            make_a_90_degree_turn(wall_turn_direction)
        }
        if (range_finder_wall_ahead()) {
            add_a_wall_in_direction(x, y, direction)
        } else {
            add_a_passage_in_direction(x, y, direction)
        }
        if (wall_turn_direction != STRAIGHT) {
            make_a_90_degree_turn(0 - wall_turn_direction)
        }
    }
}
function initialize_constants () {
    ON = 1
    spin_speed = 40
    RIGHT = 1
    STRAIGHT = 0
    LEFT = -1
    wheel_speed = 60
    Kp = 0.4
    wheel_bias = 1.05
    iterations_to_center_of_line = 66
    EQUAL = 0
}
function robot_initialize () {
    maqueenPlusV2.I2CInit()
    stop()
    radio.setGroup(42)
    send_walls = false
    initialize_constants()
    initialize_map()
    goal_x = 2
    goal_y = 4
    initialize_start_point()
    init_flood_fill()
}
function on_crossroad () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == ON && maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == ON
}
function initialize_map () {
    UNKNOWN = "?"
    WALL = "X"
    OPEN = "_"
    BLANK = "" + UNKNOWN + UNKNOWN + UNKNOWN + UNKNOWN
    map = [[
    BLANK,
    BLANK,
    BLANK,
    BLANK,
    BLANK
    ], [
    BLANK,
    BLANK,
    BLANK,
    BLANK,
    BLANK
    ], [
    BLANK,
    BLANK,
    BLANK,
    BLANK,
    BLANK
    ]]
    NORTH = 0
    EAST = 1
    SOUTH = 2
    WEST = 3
    opposite_direction = [
    SOUTH,
    WEST,
    NORTH,
    EAST
    ]
    all_four_directions = [
    NORTH,
    EAST,
    SOUTH,
    WEST
    ]
    delta_x = [
    0,
    1,
    0,
    -1
    ]
    delta_y = [
    -1,
    0,
    1,
    0
    ]
    set_implied_walls()
}
function flood_fill_the_map () {
    empty_flood_map()
    while (flood_x_queue.length > 0) {
        flood_x = flood_x_queue.shift()
        flood_y = flood_y_queue.shift()
        cost = flood_map[flood_x][flood_y]
        for (let fill_direction of all_four_directions) {
            if (!(map_has_wall_in_direction(fill_direction, flood_x, flood_y))) {
                new_x = flood_x + delta_x[fill_direction]
                new_y = flood_y + delta_y[fill_direction]
                if (flood_map[new_x][new_y] == flood_null) {
                    flood_map[new_x][new_y] = cost + 1
                    flood_x_queue.push(new_x)
                    flood_y_queue.push(new_y)
                }
            }
        }
    }
}
function radio_flood_value () {
    radio.sendNumber(flood_map[x][y])
}
function radio_send_string_and_pause (text: string) {
    radio.sendString(text)
    basic.pause(1000)
}
function Change_X_point () {
    x = (x + 1) % 3
    radio_send_coordinates()
}
radio.onReceivedString(function (receivedString) {
    if (receivedString.compare("C") == EQUAL) {
        stop()
    } else if (receivedString.compare("E") == EQUAL) {
        start()
    } else if (receivedString.compare("A") == EQUAL) {
        Change_X_point()
    } else if (receivedString.compare("B") == EQUAL) {
        change_Y_point()
    } else if (receivedString.compare("AB") == EQUAL) {
        if (send_walls) {
            radio_show_walls()
        } else {
            radio_flood_value()
        }
    } else if (receivedString.compare("f") == EQUAL) {
    	
    } else if (receivedString.compare("D") == EQUAL) {
        send_walls = !(send_walls)
    }
})
function radio_show_walls () {
    radio.sendString("" + (map[x][y]))
}
function drive_mostly_straight () {
    maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Green)
    error = maqueenPlusV2.readLineSensorData(maqueenPlusV2.MyEnumLineSensor.SensorL1) - maqueenPlusV2.readLineSensorData(maqueenPlusV2.MyEnumLineSensor.SensorR1)
    wheel_delta = error * Kp
    if (Math.abs(wheel_delta) < wheel_speed) {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, (wheel_speed + wheel_delta) * wheel_bias)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, wheel_speed - wheel_delta)
    } else {
        maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Yellow)
        if (wheel_delta > 0) {
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, Math.min(wheel_speed + wheel_delta, 255))
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, Math.min(Math.abs(wheel_speed - wheel_delta), 255))
        } else {
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, Math.min(Math.abs(wheel_speed + wheel_delta), 255))
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, Math.min(wheel_speed - wheel_delta, 255))
        }
    }
}
function start () {
    initialize_start_point()
    find_walls()
    flood_fill_the_map()
    choose_a_direction()
    go = true
}
function direction_after_turn (turn_direction: number) {
    return (direction + (turn_direction + 4)) % 4
}
let wheel_delta = 0
let error = 0
let new_y = 0
let new_x = 0
let cost = 0
let flood_y = 0
let flood_x = 0
let all_four_directions: number[] = []
let BLANK = ""
let send_walls = false
let wheel_bias = 0
let Kp = 0
let wheel_speed = 0
let UNKNOWN = ""
let rangefinder = 0
let index = 0
let go = false
let flood_y_queue: number[] = []
let flood_x_queue: number[] = []
let flood_goal_value = 0
let goal_y = 0
let goal_x = 0
let flood_null = 0
let EQUAL = 0
let OPEN = ""
let WEST = 0
let SOUTH = 0
let EAST = 0
let NORTH = 0
let map: string[][] = []
let walls: string[] = []
let flood_map: number[][] = []
let ON = 0
let spin_speed = 0
let iterations_to_center_of_line = 0
let WALL = ""
let delta_y: number[] = []
let y = 0
let delta_x: number[] = []
let x = 0
let direction = 0
let opposite_direction: number[] = []
let RIGHT = 0
let LEFT = 0
let STRAIGHT = 0
let proposed_direction = 0
robot_initialize()
basic.forever(function () {
    if (go) {
        if (on_crossroad()) {
            center_on_crossroad()
            if (go) {
                find_walls()
                flood_fill_the_map()
                choose_a_direction()
            }
        } else {
            drive_mostly_straight()
        }
    }
    show_line_sensors()
})
