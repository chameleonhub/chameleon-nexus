import {
    Bloodtype,
    CrueltyFree,
    Healing,
    MedicalServices,
    Pets,
    Vaccines,
} from "@mui/icons-material";

type MotifStripProps = {
    variant: "header" | "footer";
};

export default function MotifStrip({variant}: MotifStripProps) {
    return (
        <div className={`motif-strip ${variant}`} aria-hidden="true">
            <span className="strip-icon s1"><Pets /></span>
            <span className="strip-icon s2"><MedicalServices /></span>
            <span className="strip-icon s3"><Bloodtype /></span>
            <span className="strip-icon s4"><Healing /></span>
            <span className="strip-icon s5"><CrueltyFree /></span>
            <span className="strip-icon s6"><Vaccines /></span>
            <span className="strip-capsule s7" />
            <span className="strip-capsule s8" />
            <span className="strip-cross s9" />
            <span className="strip-cross s10" />
        </div>
    );
}
