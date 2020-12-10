export class Const {
    // AttributeBar's constants
    static readonly MAX_WIDTH_VALUE: number = 100;
    static readonly MAX_DROPLETS_WIDTH_VALUE: number = 10;
    static readonly MAX_FREQUENCY_VALUE: number = 999;
    static readonly IMAGE_ZOOM: number = 60;
    static readonly MAX_DEGREE: number = 360;
    static readonly MAX_INPUT_POSITIVE_LENGTH: number = 3;
    static readonly MAX_INPUT_NEGATIVE_LENGTH: number = 4;
    static readonly PIPETTE_IMAGE_WIDTH: number = 10;
    static readonly PIPETTE_IMAGE_HEIGHT: number = 10;
    static readonly PIPETTE_IMAGE_OFFSET_Y: number = -5;
    static readonly PIPETTE_IMAGE_OFFSET_X: number = 3;
    static readonly RECT_STROKE: number = 4;
    static readonly RECT_SIZE: number = 5;

    // add-tags's constants
    static readonly TAGS_ARRAY_SIZE_MAX: number = 8;

    // carousel's constants
    static readonly DRAWINGS_TO_SHOW_LIMIT: number = 3;

    // color-picker's constants
    static readonly DEFAULT_OPACITY: number = 100;
    static readonly DEFAULT_COLOR: string = '#000000';
    static readonly MAX_COLOR_VALUE: number = 255;
    static readonly PERCENTAGE_DIVIDER: number = 100;
    static readonly MAX_SAVED_COLORS: number = 10;

    // color-slider's constants
    static readonly STARTING_ARC_RADIUS: number = 10;
    static readonly STARTING_LINE_WIDTH: number = 5;

    // drawing-card's constants
    static readonly CONTAINER_WIDTH: number = 301;
    static readonly CONTAINER_HEIGHT: number = 200;

    // sideBar's constants
    static readonly COLOR_STRING_LENGTH: number = 7;

    // Stamps's component constants
    static readonly FACES_STAMPS_LENGHT: number = 18;
    static readonly NATURE_STAMPS_LENGHT: number = 24;
    static readonly FLAGS_STAMPS_LENGHT: number = 14;
    static readonly CORONA_STAMPS_LENGHT: number = 17;
    static readonly APPS_STAMPS_LENGHT: number = 13;
    static readonly FOOD_STAMPS_LENGHT: number = 23;
    static readonly MAX_STAMP_FACTOR: number = 9;

    // Drawing's service constants
    static readonly DEFAULT_WIDTH_CANVAS: number = 1000;
    static readonly DEFAULT_HEIGHT: number = 800;
    static readonly MIN_WORKSPACE_SIZE: number = 500;
    static readonly MIN_CANVAS_SIZE: number = 250;
    static readonly SIDEBAR_WIDTH: number = 50;

    // filterByTag service's constants
    static readonly NOT_FOUND_INDEX: number = -1;
    static readonly MAX_TO_SHOW: number = 3;

    // resizing service constants
    static readonly MIN_SIZE: number = 250;
    static readonly PROPORTION_SIZE: number = 0.95;

    // Brush tool constans
    static readonly IMAGE_SIZE_DIVIDER: number = 3;
    static readonly MOUSE_POSITION_OFFSET_DIVIDER: number = 10;
    static readonly IMAGES_PER_POINT: number = 5;
    static readonly MAX_EIGHT_BIT_NB: number = 255;
    static readonly BASE_SIZE: number = 250;
    static readonly MINIMUM_BRUSH_SIZE: number = 10;

    // Ellipse tool constants
    static readonly LINE_DASH_SEGMENT_START: number = 5;
    static readonly LINE_DASH_SEGMENT_END: number = 15;

    // Erase tool constans
    static readonly MINIMUM_ERASER_SIZE: number = 5;

    // grid tool connstants
    static readonly SQUARE_SIZE_DIFFERENCE: number = 5;
    static readonly MAX_SQUARE_SIZE: number = 100;
    static readonly MIN_SQUARE_SIZE: number = 5;
    static readonly STARTING_SQUARE_SIZE: number = 25;
    static readonly STARTING_OPACITY: number = 50;

    // line tool constants
    static readonly LINE_MIN_DISTANCE: number = 20;
    static readonly ANGLE_VALUE: number = 45;
    static readonly ALLIGNEMENT_ANGLE: number = Math.PI * Const.ANGLE_VALUE;

    // magic wand service constants
    static readonly OFFSET_FOR_SHADOW: number = 2;

    // magic wand selection constants
    static readonly RGB_NUMBER_OF_COMPONENTS: number = 3;

    // pain bucket constants
    static readonly MAX_8BIT_NBR: number = 255;
    static readonly MIN_TOLERANCE: number = 0;
    static readonly MAX_TOLERANCE: number = 100;

    // pencil tool constants
    static readonly DEFAULT_PENCIL_WIDTH: number = 1;

    // pipette tool constants
    static readonly OPACITY_INDEX: number = 3;

    // plume tool constants
    static readonly DEFAULT_ANGLE: number = 0;
    static readonly DEFAULT_WIDTH: number = 2;
    static readonly LONGEUR_LIGNE: number = 50;
    static readonly TAILLE_MAX_DATA_PATH: number = 2;
    static readonly SINGLE_STEP: number = 0.0174533; // 1° en radians
    static readonly MULTIPLE_STEP: number = 0.261799; // 15° en radians
    static readonly PI: number = Math.PI;
    static readonly POS_NUMBER: number = 1;
    // polygone tool constants
    static readonly MINIMUM_NUMBER_OF_SIDES: number = 3;
    static readonly PREVIEW_CIRCLE_LINE_WIDTH: number = 3;
    static readonly PREVIEW_CIRCLE_LINE_DASH_MIN: number = 5;
    static readonly PREVIEW_CIRCLE_LINE_DASH_MAX: number = 15;

    // spray tool constants
    static readonly DEFAULT_FREQUENCY: number = 700;
    static readonly DEFAULT_RADIUS: number = 20;
    static readonly DENSITY: number = 10;
    static readonly MULTIPLICATIONFACTOR: number = 1000;

    // stamp tool constants
    static readonly DEFAULT_IMAGE_SIZE: number = 100;

    // Text service constants
    static readonly DEFAULT_BOX_WIDTH: number = 200;
    static readonly DEFAULT_FONT_SIZE: number = 30;
    static readonly CURSOR_LENGHT: number = 8;
    static readonly TIMER_MS: number = 500;
    static readonly BIG_TEXT_SIZE: number = 60;
    static readonly SMALL_TEXT_SIZE: number = 15;
    static readonly NEGATIV_STEP: number = -1;
    static readonly HEIGHT_TOLERANCE_BIG_TEXT: number = 0.35;
    static readonly HEIGHT_TOLERANCE_SMALL_TEXT: number = 0.333;
    static readonly TEXT_POSITION_TOLERANCE: number = 4;
    static readonly CURSOR_POSITION_Y_TOLERANCE: number = 0.1;
    static readonly HEIGHT_TOLERANCE: number = 10;
    static readonly WIDTH_TOLERANCE: number = 12;
    static readonly LINE_DASH_MAX: number = 5;
    static readonly LINE_DASH_MIN: number = 4;
    static readonly CHAR_WIDTH_TOLERANCE: number = 0.09;
    // tool class constants
    static readonly RADIX_HEX: number = 16;
    static readonly RED_END_RANGE: number = 3;
    static readonly GREEN_END_RANGE: number = 5;
    static readonly BLUE_END_RANGE: number = 7;
    static readonly OPACITY_END_RANGE: number = 9;
    // comon constants
    static readonly FULL_CIRCLE: number = 360;
    static readonly PI_ANGLE: number = 180;
    static readonly RGBA_NUMBER_OF_COMPONENTS: number = 4;
}
