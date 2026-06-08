import {
    Bloodtype,
    CrueltyFree,
    HealthAndSafety,
    Healing,
    LocalHospital,
    MedicalServices,
    MonitorHeart,
    Pets,
    Vaccines,
} from "@mui/icons-material";

export default function BackgroundMotifs() {
    return (
        <div className="bahis-shape-field" aria-hidden="true">
            <span className="vet-mark icon-mark a1"><Pets /></span>
            <span className="vet-mark icon-mark a2"><MedicalServices /></span>
            <span className="vet-mark icon-mark a3"><Vaccines /></span>
            <span className="vet-mark icon-mark a4"><MonitorHeart /></span>
            <span className="vet-mark icon-mark a5"><HealthAndSafety /></span>
            <span className="vet-mark icon-mark a6"><LocalHospital /></span>
            <span className="vet-mark icon-mark a15"><Bloodtype /></span>
            <span className="vet-mark icon-mark a16"><Healing /></span>
            <span className="vet-mark icon-mark a17"><CrueltyFree /></span>
            <span className="vet-mark icon-mark a18"><MedicalServices /></span>
            <span className="vet-mark hoof-mark a7"><i /><i /></span>
            <span className="vet-mark hoof-mark a8"><i /><i /></span>
            <span className="vet-mark cross-mark a9" />
            <span className="vet-mark cross-mark a10" />
            <span className="vet-mark capsule-mark a11" />
            <span className="vet-mark capsule-mark a12" />
            <span className="vet-mark capsule-mark a19" />
            <span className="vet-mark capsule-mark a20" />
            <span className="vet-mark ring-mark a13" />
            <span className="vet-mark ring-mark a14" />
        </div>
    );
}
