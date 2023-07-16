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
    y = (y + 1) % 5
    radio_send_coordinates()
}
function set_wall_type (the_x: number, the_y: number, the_direction: number, _type: string) {
    walls = map[the_x][the_y].split("")
    walls[the_direction] = _type
    map[the_x][the_y] = "" + walls[NORTH] + walls[EAST] + walls[SOUTH] + walls[WEST]
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
        set_wall_type(index, 0, NORTH, WALL)
        set_wall_type(index, 4, SOUTH, WALL)
        index += 1
    }
    index = 0
    for (let index2 = 0; index2 < 5; index2++) {
        set_wall_type(0, index, WEST, WALL)
        set_wall_type(2, index, EAST, WALL)
        index += 1
    }
}
function add_a_wall (x_location: number, y_location: number, wall_direction: number) {
    set_wall_type(x_location, y_location, wall_direction, WALL)
    set_wall_type(x_location + delta_x[wall_direction], y_location + delta_y[wall_direction], opposite_direction[wall_direction], WALL)
}
function can_go (turn_direction: number) {
    proposed_direction = direction_after_turn(turn_direction)
    return map[x][y].substr(proposed_direction, 1).compare(OPEN) == EQUAL
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
    check_goal()
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
function radio_change_the_map (change_x: number, change_y: number, change_direction: number, change_type: string) {
    let debug = 0
    if (debug) {
        radio.sendString("" + change_type + " " + change_x + " " + change_y + " " + change_direction)
        basic.pause(3000)
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
function left_hand_algorithm () {
    if (is_wall_ahead_unknown(direction_after_turn(LEFT))) {
        look_for_wall(LEFT)
        if (can_go(STRAIGHT)) {
            return
        } else {
            make_a_90_degree_turn(RIGHT)
        }
    } else {
        if (can_go(LEFT)) {
            make_a_90_degree_turn(LEFT)
            return
        }
    }
    look_for_wall(STRAIGHT)
    if (can_go(STRAIGHT)) {
        return
    }
    if (is_wall_ahead_unknown(direction_after_turn(RIGHT))) {
        look_for_wall(RIGHT)
        if (!(can_go(STRAIGHT))) {
            make_a_90_degree_turn(RIGHT)
        }
    } else {
        if (can_go(RIGHT)) {
            make_a_90_degree_turn(RIGHT)
        } else {
            make_a_90_degree_turn(RIGHT)
            make_a_90_degree_turn(RIGHT)
        }
    }
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
        radio_show_walls()
    } else if (receivedString.compare("D") == EQUAL) {
    	
    }
})
function radio_show_walls () {
    radio.sendString("" + (map[x][y]))
}
function center_of_line () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == ON
}
function is_wall_ahead_unknown (wall_direction: number) {
    return map[x][y].substr(wall_direction, 1).compare(UNKNOWN) == EQUAL
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
function start () {
    left_hand_algorithm()
    go = true
}
function direction_after_turn (turn_direction: number) {
    return (direction + (turn_direction + 4)) % 4
}
function wall_ahead () {
    rangefinder = maqueenPlusV2.readUltrasonic(DigitalPin.P13, DigitalPin.P14)
    // 0 distance is infinity
    return rangefinder <= 4 && rangefinder > 0
}
let rangefinder = 0
let wheel_delta = 0
let error = 0
let BLANK = ""
let UNKNOWN = ""
let wheel_bias = 0
let Kp = 0
let wheel_speed = 0
let iterations_to_center_of_line = 0
let EQUAL = 0
let WALL = ""
let index = 0
let go = false
let STRAIGHT = 0
let proposed_direction = 0
let opposite_direction: number[] = []
let delta_y: number[] = []
let delta_x: number[] = []
let OPEN = ""
let spin_speed = 0
let LEFT = 0
let RIGHT = 0
let WEST = 0
let SOUTH = 0
let NORTH = 0
let map: string[][] = []
let walls: string[] = []
let ON = 0
let goal_y = 0
let goal_x = 0
let EAST = 0
let direction = 0
let y = 0
let x = 0
maqueenPlusV2.I2CInit()
radio.setGroup(42)
initialize_constants()
initialize_map()
stop()
x = 0
y = 0
direction = EAST
radio_send_coordinates()
goal_x = 2
goal_y = 4
basic.forever(function () {
    if (go) {
        if (on_crossroad()) {
            center_on_crossroad()
            if (go) {
                left_hand_algorithm()
            }
        } else {
            drive_mostly_straight()
        }
    }
    show_line_sensors()
})
