from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, model_validator


class PharmacyItemModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    medicine: str
    dosage: str
    quantity: int = Field(gt=0)
    unit_price: float = Field(
        alias="unitPrice",
        ge=0,
    )
    in_stock: bool = Field(
        alias="inStock",
        default=True,
    )


class CheckoutRequestModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    prescription_id: str = Field(
        default="legacy-checkout",
        alias="prescriptionId",
    )
    patient_id: str = Field(alias="patientId")
    address: str = ""
    items: list[PharmacyItemModel] = Field(default_factory=list)
    delivery_fee: float = Field(
        default=0,
        alias="deliveryFee",
        ge=0,
    )
    # Backward-compatible fields used by the original checkout request.
    medicine: str | None = None
    quantity: int | None = Field(default=None, gt=0)
    total: float = Field(default=0, ge=0)

    @model_validator(mode="before")
    @classmethod
    def normalize_legacy_checkout(cls, values: object) -> object:
        if not isinstance(values, dict) or values.get("items"):
            return values

        medicine = values.get("medicine")
        quantity = values.get("quantity")
        if not medicine or not quantity:
            return values

        total = float(values.get("total", 0))
        values = dict(values)
        values["prescriptionId"] = values.get(
            "prescriptionId",
            "legacy-checkout",
        )
        values["items"] = [{
            "id": 1,
            "medicine": medicine,
            "dosage": "Not specified",
            "quantity": quantity,
            "unitPrice": total / quantity,
            "inStock": True,
        }]
        return values


class VitalRecordModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    recorded_at: str = Field(alias="recordedAt")
    heart_rate: float = Field(alias="heartRate", gt=0)
    temperature: float = Field(gt=0)
    systolic: float = Field(gt=0)
    diastolic: float = Field(gt=0)
    oxygen: float = Field(gt=0, le=100)
