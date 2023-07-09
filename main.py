def show_line_sensors():
    basic.clear_screen()
    if maqueenPlusV2.read_line_sensor_state(maqueenPlusV2.MyEnumLineSensor.SENSOR_R1) == 1:
        led.plot(1, 2)
    if maqueenPlusV2.read_line_sensor_state(maqueenPlusV2.MyEnumLineSensor.SENSOR_M) == 1:
        led.plot(2, 2)
    if maqueenPlusV2.read_line_sensor_state(maqueenPlusV2.MyEnumLineSensor.SENSOR_L1) == 1:
        led.plot(3, 2)
def on_crossroad():
    return maqueenPlusV2.read_line_sensor_state(maqueenPlusV2.MyEnumLineSensor.SENSOR_L1) == ON and maqueenPlusV2.read_line_sensor_state(maqueenPlusV2.MyEnumLineSensor.SENSOR_R1) == ON
def make_a_90_degree_turn(direction: number):
    maqueenPlusV2.show_color(maqueenPlusV2.NeoPixelColors.YELLOW)
    if direction >= 0:
        maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.LEFT_MOTOR,
            maqueenPlusV2.MyEnumDir.FORWARD,
            spin_speed)
        maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.RIGHT_MOTOR,
            maqueenPlusV2.MyEnumDir.BACKWARD,
            spin_speed)
    else:
        maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.LEFT_MOTOR,
            maqueenPlusV2.MyEnumDir.BACKWARD,
            spin_speed)
        maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.RIGHT_MOTOR,
            maqueenPlusV2.MyEnumDir.FORWARD,
            spin_speed)
    while on_line():
        basic.pause(1)
    while not (on_line()):
        basic.pause(1)
    maqueenPlusV2.control_motor_stop(maqueenPlusV2.MyEnumMotor.ALL_MOTOR)
def stop():
    global go
    maqueenPlusV2.control_motor_stop(maqueenPlusV2.MyEnumMotor.ALL_MOTOR)
    go = False
    maqueenPlusV2.show_color(maqueenPlusV2.NeoPixelColors.RED)
def set_implied_walls():
    global index
    index = 0
    # for index loop doesn't work
    for index2 in range(3):
        add_a_wall(index, 0, NORTH)
        add_a_wall(index, 4, SOUTH)
        index += 1
    index = 0
    for index22 in range(5):
        add_a_wall(0, index, WEST)
        add_a_wall(2, index, EAST)
        index += 1
def add_a_wall(x_location: number, y_location: number, direction2: number):
    global separate_walls
    separate_walls = map2[x_location][y_location].split(" ")
    separate_walls[direction2] = WALL
    map2[x_location][y_location] = "" + separate_walls[NORTH] + separate_walls[EAST] + separate_walls[SOUTH] + separate_walls[WEST]

def on_button_pressed_a():
    global x
    led.unplot(x, y)
    x = (x + 1) % 3
    led.plot(x, y)
input.on_button_pressed(Button.A, on_button_pressed_a)

def initialize_test_turns():
    global test_turns, next_turn
    test_turns = [STRAIGHT, RIGHT, RIGHT, STRAIGHT, RIGHT, RIGHT]
    next_turn = 0
def center_on_crossroad():
    for index23 in range(iterations_to_center_of_line):
        drive_mostly_straight()
        basic.pause(1)
    maqueenPlusV2.control_motor_stop(maqueenPlusV2.MyEnumMotor.ALL_MOTOR)
def on_line():
    return maqueenPlusV2.read_line_sensor_state(maqueenPlusV2.MyEnumLineSensor.SENSOR_L1) == ON or (maqueenPlusV2.read_line_sensor_state(maqueenPlusV2.MyEnumLineSensor.SENSOR_R1) == ON or maqueenPlusV2.read_line_sensor_state(maqueenPlusV2.MyEnumLineSensor.SENSOR_M) == ON)
def make_a_turn():
    global next_turn
    if test_turns[next_turn] == LEFT or test_turns[next_turn] == RIGHT:
        make_a_90_degree_turn(test_turns[next_turn])
    next_turn = (next_turn + 1) % len(test_turns)
def initialize_constants():
    global ON, spin_speed, RIGHT, STRAIGHT, LEFT, wheel_speed, Kp, wheel_bias, iterations_to_center_of_line
    ON = 1
    spin_speed = 40
    RIGHT = 1
    STRAIGHT = 0
    LEFT = -1
    wheel_speed = 60
    Kp = 0.4
    wheel_bias = 1.05
    iterations_to_center_of_line = 66
def initialize_map():
    global UNKNOWN, WALL, OPEN, BLANK, map2, NORTH, EAST, SOUTH, WEST, opposite_direction, x, y
    UNKNOWN = "?"
    WALL = "X"
    OPEN = "_"
    BLANK = "" + UNKNOWN + UNKNOWN + UNKNOWN + UNKNOWN
    map2 = [[BLANK, BLANK, BLANK, BLANK, BLANK],
        [BLANK, BLANK, BLANK, BLANK, BLANK],
        [BLANK, BLANK, BLANK, BLANK, BLANK]]
    NORTH = 0
    EAST = 1
    SOUTH = 2
    WEST = 3
    opposite_direction = [SOUTH, WEST, NORTH, EAST]
    set_implied_walls()
    x = 0
    y = 0
    led.plot(x, y)
def adjust_stop_point(received_message: str):
    global iterations_to_center_of_line
    if received_message.compare("A") == 0:
        iterations_to_center_of_line += 1
        radio.send_number(iterations_to_center_of_line)
    elif received_message.compare("B") == 0:
        iterations_to_center_of_line += -1
        radio.send_number(iterations_to_center_of_line)

def on_button_pressed_ab():
    basic.show_string("" + (map2[x][y]))
    led.plot(x, y)
input.on_button_pressed(Button.AB, on_button_pressed_ab)

def on_received_string(receivedString):
    global go
    if receivedString.compare("C") == 0:
        stop()
    elif receivedString.compare("E") == 0:
        go = True
radio.on_received_string(on_received_string)

def on_button_pressed_b():
    global y
    led.unplot(x, y)
    y = (y + 1) % 5
    led.plot(x, y)
input.on_button_pressed(Button.B, on_button_pressed_b)

def drive_mostly_straight():
    global error, wheel_delta
    maqueenPlusV2.show_color(maqueenPlusV2.NeoPixelColors.GREEN)
    error = maqueenPlusV2.read_line_sensor_data(maqueenPlusV2.MyEnumLineSensor.SENSOR_L1) - maqueenPlusV2.read_line_sensor_data(maqueenPlusV2.MyEnumLineSensor.SENSOR_R1)
    wheel_delta = error * Kp
    if abs(wheel_delta) < wheel_speed:
        maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.LEFT_MOTOR,
            maqueenPlusV2.MyEnumDir.FORWARD,
            (wheel_speed + wheel_delta) * wheel_bias)
        maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.RIGHT_MOTOR,
            maqueenPlusV2.MyEnumDir.FORWARD,
            wheel_speed - wheel_delta)
    else:
        maqueenPlusV2.show_color(maqueenPlusV2.NeoPixelColors.YELLOW)
        if wheel_delta > 0:
            maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.LEFT_MOTOR,
                maqueenPlusV2.MyEnumDir.FORWARD,
                min(wheel_speed + wheel_delta, 255))
            maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.RIGHT_MOTOR,
                maqueenPlusV2.MyEnumDir.BACKWARD,
                min(abs(wheel_speed - wheel_delta), 255))
        else:
            maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.LEFT_MOTOR,
                maqueenPlusV2.MyEnumDir.BACKWARD,
                min(abs(wheel_speed + wheel_delta), 255))
            maqueenPlusV2.control_motor(maqueenPlusV2.MyEnumMotor.RIGHT_MOTOR,
                maqueenPlusV2.MyEnumDir.FORWARD,
                min(wheel_speed - wheel_delta, 255))
wheel_delta = 0
error = 0
opposite_direction: List[number] = []
BLANK = ""
OPEN = ""
UNKNOWN = ""
wheel_bias = 0
Kp = 0
wheel_speed = 0
LEFT = 0
iterations_to_center_of_line = 0
next_turn = 0
RIGHT = 0
STRAIGHT = 0
test_turns: List[number] = []
y = 0
x = 0
WALL = ""
EAST = 0
WEST = 0
SOUTH = 0
NORTH = 0
index = 0
go = False
spin_speed = 0
ON = 0
separate_walls: List[str] = []
map2: List[List[str]] = []
radio.set_group(42)
initialize_constants()
initialize_map()
initialize_test_turns()
stop()

def on_forever():
    if go:
        if on_crossroad():
            center_on_crossroad()
            make_a_turn()
        else:
            drive_mostly_straight()
basic.forever(on_forever)
