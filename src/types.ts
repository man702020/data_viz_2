type CallStatus = "NEW" | "OPEN" | "CLOS";

interface CallData {
    SERVICE_REQUEST_ID?: string;
    STATUS?: CallStatus;
    SERVICE_NAME?: string;
    SERVICE_CODE?: string;
    DESCRIPTION?: string;
    AGENCY_RESPONSIBLE?: string;
    REQUESTED_DATETIME?: Date;
    UPDATED_DATETIME?: Date;
    EXPECTED_DATETIME?: Date;
    ADDRESS?: string;
    ZIPCODE?: string;
    LATITUDE?: number;
    LONGITUDE?: number;
    REQUESTED_DATE?: Date;
    UPDATED_DATE?: Date;
    LAST_TABLE_UPDATE?: Date;
}



interface Margin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
interface DrawConfig {
    // parent: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    parent: string;
    width: number;
    height: number;
    margin?: Margin;
    className?: string;
}

interface Point2D {
    x: number;
    y: number;
}
