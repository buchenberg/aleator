package dev.gbuchenberger.aleator.domain.local;

public class Random {
	
	private final long id;
    private final String content;

    public Random(long id, String content) {
        this.id = id;
        this.content = content;
    }

    public long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

}
