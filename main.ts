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
function on_crossroad () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == ON && maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == ON
}
function change_Y_point () {
    led.unplot(x, y)
    y = (y + 1) % 5
    led.plot(x, y)
    radio_send_coordinates()
}
function set_wall_type (the_x: number, the_y: number, the_direction: number, _type: string) {
    if (debug) {
        radio.sendString("" + _type + " " + the_x + " " + the_y + " in " + the_direction)
        basic.pause(3000)
    }
    walls = map[the_x][the_y].split("")
    walls[the_direction] = _type
    map[the_x][the_y] = "" + walls[NORTH] + walls[EAST] + walls[SOUTH] + walls[WEST]
}
function make_a_90_degree_turn (turn_direction: number) {
    maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Yellow)
    if (turn_direction == RIGHT) {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, spin_speed)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, spin_speed)
    } else if (turn_direction == LEFT) {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, spin_speed)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, spin_speed)
    }
    while (on_line()) {
        basic.pause(1)
    }
    while (!(center_of_line())) {
        basic.pause(1)
    }
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    direction = direction_after_turn(turn_direction)
}
function add_a_passage (x_location: number, y_location: number, pass_direction: number) {
    set_wall_type(x_location, y_location, pass_direction, OPEN)
    set_wall_type(x_location + delta_x[pass_direction], y_location + delta_y[pass_direction], opposite_direction[pass_direction], OPEN)
}
function look_for_wall (wall_turn_direction: number) {
    proposed_direction = direction_after_turn(wall_turn_direction)
    if (is_wall_ahead_unknown(proposed_direction)) {
        if (wall_turn_direction != STRAIGHT) {
            make_a_90_degree_turn(wall_turn_direction)
        }
        if (wall_ahead()) {
            add_a_wall(x, y, direction)
        } else {
            add_a_passage(x, y, direction)
        }
        if (wall_turn_direction != STRAIGHT) {
            make_a_90_degree_turn(0 - wall_turn_direction)
        }
    }
}
function stop () {
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    go = false
    maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Red)
}
function set_implied_walls () {
    index = 0
    for (let index2 = 0; index2 < 3; index2++) {
        add_a_wall(index, 0, NORTH)
        add_a_wall(index, 4, SOUTH)
        index += 1
    }
    index = 0
    for (let index2 = 0; index2 < 5; index2++) {
        add_a_wall(0, index, WEST)
        add_a_wall(2, index, EAST)
        index += 1
    }
}
function add_a_wall (x_location: number, y_location: number, wall_direction: number) {
    set_wall_type(x_location, y_location, wall_direction, WALL)
    set_wall_type(x_location + delta_x[wall_direction], y_location + delta_y[wall_direction], opposite_direction[wall_direction], WALL)
}
function initialize_test_turns () {
    next_turn = 0
    test_turns = [STRAIGHT]
}
function radio_send_coordinates () {
    radio.sendValue("X", x)
    radio.sendValue("Y", y)
}
function center_on_crossroad () {
    for (let index2 = 0; index2 < iterations_to_center_of_line; index2++) {
        drive_mostly_straight()
        basic.pause(1)
    }
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    update_coordinates(direction)
}
function on_line () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == ON || (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == ON || maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == ON)
}
function make_a_turn () {
    if (test_turns[next_turn] != STRAIGHT) {
        make_a_90_degree_turn(test_turns[next_turn])
    }
    next_turn = (next_turn + 1) % test_turns.length
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
    set_implied_walls()
    x = 1
    y = 0
    direction = SOUTH
    radio_send_coordinates()
    led.plot(x, y)
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
}
radio.onReceivedString(function (receivedString) {
    if (receivedString.compare("C") == EQUAL) {
        stop()
    } else if (receivedString.compare("E") == EQUAL) {
        go = true
    } else if (receivedString.compare("A") == EQUAL) {
        Change_X_point()
    } else if (receivedString.compare("B") == EQUAL) {
        change_Y_point()
    } else if (receivedString.compare("AB") == EQUAL) {
        radio_show_walls()
    } else if (receivedString.compare("D") == EQUAL) {
        Find_walls()
    }
})
function Change_X_point () {
    led.unplot(x, y)
    x = (x + 1) % 3
    led.plot(x, y)
    radio_send_coordinates()
}
function radio_show_walls () {
    radio.sendString("" + (map[x][y]))
}
function center_of_line () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == ON
}
function is_wall_ahead_unknown (wall_direction: number) {
    return map[x][y].substr(wall_direction, 1).compare(UNKNOWN) == EQUAL
}
function Find_walls () {
    look_for_wall(STRAIGHT)
    look_for_wall(LEFT)
    look_for_wall(RIGHT)
}
function update_coordinates (direction: number) {
    x = x + delta_x[direction]
    y = y + delta_y[direction]
    radio_send_coordinates()
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
function direction_after_turn (turn_direction: number) {
    return (direction + (turn_direction + 4)) % 4
}
function wall_ahead () {
    // 0 distance is infinity
    return maqueenPlusV2.readUltrasonic(DigitalPin.P13, DigitalPin.P14) <= 3 && maqueenPlusV2.readUltrasonic(DigitalPin.P13, DigitalPin.P14) > 0
}
let wheel_delta = 0
let error = 0
let BLANK = ""
let UNKNOWN = ""
let EQUAL = 0
let wheel_bias = 0
let Kp = 0
let wheel_speed = 0
let iterations_to_center_of_line = 0
let test_turns: number[] = []
let next_turn = 0
let WALL = ""
let index = 0
let go = false
let STRAIGHT = 0
let proposed_direction = 0
let opposite_direction: number[] = []
let delta_y: number[] = []
let delta_x: number[] = []
let OPEN = ""
let direction = 0
let spin_speed = 0
let LEFT = 0
let RIGHT = 0
let WEST = 0
let SOUTH = 0
let EAST = 0
let NORTH = 0
let map: string[][] = []
let walls: string[] = []
let y = 0
let x = 0
let ON = 0
let debug = false
maqueenPlusV2.I2CInit()
radio.setGroup(42)
debug = false
initialize_constants()
initialize_map()
initialize_test_turns()
stop()
debug = true
basic.forever(function () {
    if (go) {
        if (on_crossroad()) {
            center_on_crossroad()
            radio_show_walls()
            Find_walls()
            radio_show_walls()
            make_a_turn()
        } else {
            drive_mostly_straight()
        }
    }
})
