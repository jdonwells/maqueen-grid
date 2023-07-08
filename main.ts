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
function initialize_test_turns () {
    test_turns = [
    STRAIGHT,
    RIGHT,
    RIGHT,
    STRAIGHT,
    RIGHT,
    RIGHT
    ]
    next_turn = 0
}
function center_on_crossroad () {
    for (let index = 0; index < iterations_to_center_of_line; index++) {
        drive_mostly_straight()
        basic.pause(1)
    }
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
}
function make_a_90_degree_turn (direction: number) {
    maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Yellow)
    if (direction >= 0) {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, spin_speed)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, spin_speed)
    } else {
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, spin_speed)
        maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, spin_speed)
    }
    while (on_line()) {
        basic.pause(1)
    }
    while (!(on_line())) {
        basic.pause(1)
    }
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
}
function stop () {
    maqueenPlusV2.controlMotorStop(maqueenPlusV2.MyEnumMotor.AllMotor)
    go = false
    maqueenPlusV2.showColor(maqueenPlusV2.NeoPixelColors.Red)
}
input.onButtonPressed(Button.A, function () {
    led.unplot(x, y)
    x = (x + 1) % 3
    led.plot(x, y)
})
function set_implied_walls () {
    for (let column of map) {
        column[0] = add_wall(column[0], NORTH)
        column[4] = add_wall(column[4], SOUTH)
    }
    for (let index = 0; index <= 4; index++) {
        map[0][index] = add_wall(map[0][index], WEST)
        map[2][index] = add_wall(map[2][index], EAST)
    }
}
function on_line () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == ON || (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == ON || maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == ON)
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
}
function adjust_stop_point (received_message: string) {
    if (received_message.compare("A") == 0) {
        iterations_to_center_of_line += 1
        radio.sendNumber(iterations_to_center_of_line)
    } else if (received_message.compare("B") == 0) {
        iterations_to_center_of_line += -1
        radio.sendNumber(iterations_to_center_of_line)
    }
}
input.onButtonPressed(Button.AB, function () {
    basic.showString("" + (map[x][y]))
    led.plot(x, y)
})
radio.onReceivedString(function (receivedString) {
    if (receivedString.compare("C") == 0) {
        stop()
    } else if (receivedString.compare("E") == 0) {
        go = true
    } else if (receivedString.compare("F") == 0) {
        make_a_90_degree_turn(LEFT)
    } else if (receivedString.compare("D") == 0) {
        make_a_90_degree_turn(RIGHT)
    } else {
    	
    }
})
input.onButtonPressed(Button.B, function () {
    led.unplot(x, y)
    y = (y + 1) % 5
    led.plot(x, y)
})
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
    x = 0
    y = 0
    led.plot(x, y)
}
function add_wall (walls: string, direction: number) {
    separate_walls = walls.split("")
    separate_walls[direction] = WALL
    return "" + separate_walls[NORTH] + separate_walls[EAST] + separate_walls[SOUTH] + separate_walls[WEST]
}
function make_a_turn () {
    if (test_turns[next_turn] == LEFT || test_turns[next_turn] == RIGHT) {
        make_a_90_degree_turn(test_turns[next_turn])
    }
    next_turn = (next_turn + 1) % test_turns.length
}
let separate_walls: string[] = []
let opposite_direction: number[] = []
let BLANK = ""
let OPEN = ""
let WALL = ""
let UNKNOWN = ""
let wheel_delta = 0
let error = 0
let wheel_bias = 0
let Kp = 0
let wheel_speed = 0
let LEFT = 0
let EAST = 0
let WEST = 0
let SOUTH = 0
let NORTH = 0
let map: string[][] = []
let y = 0
let x = 0
let go = false
let spin_speed = 0
let iterations_to_center_of_line = 0
let next_turn = 0
let RIGHT = 0
let STRAIGHT = 0
let test_turns: number[] = []
let ON = 0
radio.setGroup(42)
initialize_constants()
initialize_map()
initialize_test_turns()
stop()
basic.forever(function () {
    if (go) {
        if (on_crossroad()) {
            center_on_crossroad()
            make_a_turn()
        } else {
            drive_mostly_straight()
        }
    }
})
