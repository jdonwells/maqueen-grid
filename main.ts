function show_line_sensors () {
    basic.clearScreen()
    if (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR2) == 1) {
        led.plot(0, 2)
    }
    if (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == 1) {
        led.plot(1, 2)
    }
    if (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == 1) {
        led.plot(2, 2)
    }
    if (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == 1) {
        led.plot(3, 2)
    }
    if (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL2) == 1) {
        led.plot(4, 2)
    }
}
function on_crossroad () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == ON && maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == ON
}
function center_on_crossroad () {
    start_time = input.runningTime()
    iterations = 0
    for (let index = 0; index < crossroad_pause / ms_per_iteration; index++) {
        iterations += 1
        drive_mostly_straight()
        basic.pause(1)
    }
    stop()
    radio.sendNumber((input.runningTime() - start_time) / iterations)
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
    if (on_line()) {
        while (on_line()) {
            basic.pause(1)
        }
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
function on_line () {
    return maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorL1) == ON || (maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorR1) == ON || maqueenPlusV2.readLineSensorState(maqueenPlusV2.MyEnumLineSensor.SensorM) == ON)
}
function initialize_constants () {
    crossroad_pause = 330
    ON = 1
    spin_speed = 40
    degrees_per_second = 110
    RIGHT = 1
    CENTER = 0
    LEFT = -1
    wheel_speed = 60
    Kp = 0.5
    wheel_bias = 1.05
    WHITE = 230
    ms_per_iteration = 5
}
function adjust_stop_point (received_message: string) {
    if (received_message.compare("A") == 0) {
        crossroad_pause += 5
        radio.sendNumber(crossroad_pause)
    } else if (received_message.compare("B") == 0) {
        crossroad_pause += -5
        radio.sendNumber(crossroad_pause)
    }
}
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
        adjust_stop_point(receivedString)
    }
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
        if (wheel_delta >= 0) {
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Forward, Math.min(wheel_speed + wheel_delta, 255))
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Backward, Math.min(Math.abs(wheel_speed - wheel_delta), 255))
        } else {
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.LeftMotor, maqueenPlusV2.MyEnumDir.Backward, Math.min(Math.abs(wheel_speed + wheel_delta), 255))
            maqueenPlusV2.controlMotor(maqueenPlusV2.MyEnumMotor.RightMotor, maqueenPlusV2.MyEnumDir.Forward, Math.min(wheel_speed - wheel_delta, 255))
        }
    }
}
let wheel_delta = 0
let error = 0
let WHITE = 0
let wheel_bias = 0
let Kp = 0
let wheel_speed = 0
let LEFT = 0
let CENTER = 0
let RIGHT = 0
let degrees_per_second = 0
let go = false
let spin_speed = 0
let ms_per_iteration = 0
let crossroad_pause = 0
let iterations = 0
let start_time = 0
let ON = 0
maqueenPlusV2.I2CInit()
radio.setGroup(42)
initialize_constants()
stop()
basic.showIcon(IconNames.Heart)
basic.forever(function () {
    if (go) {
        if (on_crossroad()) {
            center_on_crossroad()
        } else {
            drive_mostly_straight()
        }
    }
    show_line_sensors()
})
