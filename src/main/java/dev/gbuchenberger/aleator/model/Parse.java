package dev.gbuchenberger.aleator.model;

import java.util.List;

public class Parse {
	
	private final long id;
	private final List<String> sentences;
	
	/**
	 * @param id
	 * @param sentences
	 */
	public Parse(long id, List<String> sentences) {
		super();
		this.id = id;
		this.sentences = sentences;
	}

	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}

	/**
	 * @return the sentences
	 */
	public List<String> getSentences() {
		return sentences;
	}
	
	
	
	
	

}
