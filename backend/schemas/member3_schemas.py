from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


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

    prescription_id: str = Field(alias="prescriptionId")
    patient_id: str = Field(alias="patientId")
    address: str
    items: list[PharmacyItemModel]
    delivery_fee: float = Field(
        alias="deliveryFee",
        ge=0,
    )


class VitalRecordModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    recorded_at: str = Field(alias="recordedAt")
    heart_rate: float = Field(alias="heartRate", gt=0)
    temperature: float = Field(gt=0)
    systolic: float = Field(gt=0)
    diastolic: float = Field(gt=0)
    oxygen: float = Field(gt=0, le=100)
