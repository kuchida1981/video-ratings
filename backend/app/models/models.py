from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Work(Base):
    __tablename__ = "works"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    cover_image_path = Column(String, nullable=True)
    custom_fields = Column(JSONB, nullable=True, default=dict)
    memo = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    work_performers = relationship("WorkPerformer", back_populates="work", cascade="all, delete-orphan")
    files = relationship("WorkFile", back_populates="work", cascade="all, delete-orphan", order_by="WorkFile.order")
    work_tags = relationship("WorkTag", back_populates="work", cascade="all, delete-orphan")


class Performer(Base):
    __tablename__ = "performers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    furigana = Column(String, nullable=True, index=True)
    cover_image_path = Column(String, nullable=True)
    custom_fields = Column(JSONB, nullable=True, default=dict)
    memo = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    work_performers = relationship("WorkPerformer", back_populates="performer")
    performer_tags = relationship("PerformerTag", back_populates="performer", cascade="all, delete-orphan")
    aliases = relationship("PerformerAlias", back_populates="performer", cascade="all, delete-orphan")


class WorkPerformer(Base):
    __tablename__ = "work_performers"

    work_id = Column(Integer, ForeignKey("works.id", ondelete="CASCADE"), primary_key=True)
    performer_id = Column(Integer, ForeignKey("performers.id", ondelete="CASCADE"), primary_key=True)
    is_main = Column(Boolean, nullable=False, default=False)

    work = relationship("Work", back_populates="work_performers")
    performer = relationship("Performer", back_populates="work_performers")


class WorkFile(Base):
    __tablename__ = "work_files"

    id = Column(Integer, primary_key=True, index=True)
    work_id = Column(Integer, ForeignKey("works.id", ondelete="CASCADE"), nullable=False, index=True)
    path = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    order = Column(Integer, nullable=False, default=0)

    work = relationship("Work", back_populates="files")


class TagCategory(Base):
    __tablename__ = "tag_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)  # 'work' or 'performer'
    is_multi_select = Column(Boolean, nullable=False, default=True)
    description = Column(String, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)

    tags = relationship("Tag", back_populates="category", cascade="all, delete-orphan", order_by="Tag.sort_order.asc()")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("tag_categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    score = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)

    category = relationship("TagCategory", back_populates="tags")
    work_tags = relationship("WorkTag", back_populates="tag", cascade="all, delete-orphan")
    performer_tags = relationship("PerformerTag", back_populates="tag", cascade="all, delete-orphan")


class WorkTag(Base):
    __tablename__ = "work_tags"
    __table_args__ = (UniqueConstraint("work_id", "tag_id"),)

    work_id = Column(Integer, ForeignKey("works.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    work = relationship("Work", back_populates="work_tags")
    tag = relationship("Tag", back_populates="work_tags")


class PerformerTag(Base):
    __tablename__ = "performer_tags"
    __table_args__ = (UniqueConstraint("performer_id", "tag_id"),)

    performer_id = Column(Integer, ForeignKey("performers.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)

    performer = relationship("Performer", back_populates="performer_tags")
    tag = relationship("Tag", back_populates="performer_tags")


class CustomFieldDefinition(Base):
    __tablename__ = "custom_field_definitions"

    __table_args__ = (UniqueConstraint("entity_type", "name", name="uq_custom_field_definitions_entity_name"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    field_type = Column(String, nullable=False)  # 'text', 'number', 'date', 'boolean'
    entity_type = Column(String, nullable=False, server_default="work")  # 'work' or 'performer'
    sort_order = Column(Integer, nullable=False, default=0)
    is_sortable = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())


class PerformerAlias(Base):
    __tablename__ = "performer_aliases"

    id = Column(Integer, primary_key=True, index=True)
    performer_id = Column(Integer, ForeignKey("performers.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    furigana = Column(String, nullable=True, index=True)

    performer = relationship("Performer", back_populates="aliases")
