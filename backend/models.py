from sqlalchemy import Column, Integer, Text
from database import Base


class MeetingDB(Base):

    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(Text, nullable=False)

    transcript = Column(Text, nullable=False)

    actions = Column(Text, nullable=False)

    decisions = Column(Text, nullable=False)

    risks = Column(Text, nullable=False)

    graph = Column(Text, nullable=False)